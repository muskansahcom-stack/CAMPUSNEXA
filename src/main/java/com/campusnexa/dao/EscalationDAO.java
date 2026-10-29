package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Escalation;
import com.campusnexa.model.Notification;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for institutional grievances escalated to Higher Authority / COE.
 * Strictly adheres to Phase 14 specifications with multi-tier authority tracking and real-time audit.
 */
public class EscalationDAO {

    private static final Logger LOGGER = Logger.getLogger(EscalationDAO.class.getName());
    private final NotificationDAO notificationDAO = new NotificationDAO();

    public boolean createEscalation(Escalation esc) {
        String seqSql = "SELECT COALESCE(MAX(id), 0) + 1 AS next_seq FROM escalations FOR UPDATE";
        String insertSql = "INSERT INTO escalations (" +
                "escalation_number, complaint_id, raised_by, from_authority, to_authority, " +
                "escalated_by, escalation_type, reason, status, remarks, response_deadline, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

        String updateComplaintSql = "UPDATE complaints SET status = 'ESCALATED', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        String historySql = "INSERT INTO complaint_status_history (complaint_id, status, remarks, changed_by, created_at) " +
                "VALUES (?, 'ESCALATED', ?, ?, CURRENT_TIMESTAMP)";
        String complaintLookupSql = "SELECT complaint_number, user_id FROM complaints WHERE id = ?";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            int nextSeq = 1;
            try (PreparedStatement psSeq = conn.prepareStatement(seqSql);
                 ResultSet rsSeq = psSeq.executeQuery()) {
                if (rsSeq.next()) {
                    nextSeq = rsSeq.getInt("next_seq");
                }
            }
            String escNum = ValidationUtil.generateEscalationNumber(nextSeq);
            esc.setEscalationNumber(escNum);

            int raisedBy = esc.getRaisedBy() != null ? esc.getRaisedBy() : esc.getEscalatedBy();
            String fromAuth = esc.getFromAuthority() != null ? esc.getFromAuthority() : "DEPUTY_WARDEN";
            String toAuth = esc.getToAuthority() != null ? esc.getToAuthority() : "HIGHER_AUTHORITY";

            // 24 hour response SLA for escalations
            long deadlineMillis = System.currentTimeMillis() + (24 * 3600000L);
            Timestamp deadline = new Timestamp(deadlineMillis);
            esc.setResponseDeadline(deadline);

            int escId;
            try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, escNum);
                ps.setInt(2, esc.getComplaintId());
                ps.setInt(3, raisedBy);
                ps.setString(4, fromAuth);
                ps.setString(5, toAuth);
                ps.setInt(6, raisedBy);
                ps.setString(7, esc.getEscalationType() != null ? esc.getEscalationType() : "STUDENT_REQUEST");
                ps.setString(8, esc.getReason());
                ps.setString(9, esc.getRemarks());
                ps.setTimestamp(10, deadline);

                int rows = ps.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return false;
                }
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        escId = rs.getInt(1);
                        esc.setId(escId);
                    } else {
                        conn.rollback();
                        return false;
                    }
                }
            }

            // Update complaint status to ESCALATED
            try (PreparedStatement psComp = conn.prepareStatement(updateComplaintSql)) {
                psComp.setInt(1, esc.getComplaintId());
                psComp.executeUpdate();
            }

            // Insert status history record
            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, esc.getComplaintId());
                psHist.setString(2, "Escalated to Higher Authority (" + escNum + "): " + esc.getReason());
                psHist.setInt(3, raisedBy);
                psHist.executeUpdate();
            }

            // Notify Higher Authority in notifications table
            String compNum = "";
            try (PreparedStatement psCompLookup = conn.prepareStatement(complaintLookupSql)) {
                psCompLookup.setInt(1, esc.getComplaintId());
                try (ResultSet rs = psCompLookup.executeQuery()) {
                    if (rs.next()) {
                        compNum = rs.getString("complaint_number");
                    }
                }
            }

            String notifTitle = "Urgent Escalation " + escNum;
            String snippet = esc.getReason().length() > 65 ? esc.getReason().substring(0, 62) + "..." : esc.getReason();
            String notifBody = "Ticket #" + compNum + " escalated: " + snippet;
            notifyHigherAuthorities(conn, esc.getComplaintId(), notifTitle, notifBody, "/higher-authority-dashboard.html#escalated");

            // Notify student complainant
            if (raisedBy > 0) {
                Notification studentNotif = new Notification(
                        0, raisedBy, esc.getComplaintId(), "COMPLAINT_ESCALATED",
                        "Escalation Registered: " + escNum,
                        "Your escalation request (" + escNum + ") for ticket #" + compNum + " was successfully forwarded to Higher Authority.",
                        "/student-dashboard.html#escalate",
                        false, "HIGH", null, null
                );
                notificationDAO.createNotification(studentNotif);
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating escalation for complaint: " + esc.getComplaintId(), e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ignored) {}
            }
        }
    }

    private void notifyHigherAuthorities(Connection conn, int complaintId, String title, String body, String link) {
        String sql = "SELECT id FROM users WHERE role IN ('HIGHER_AUTHORITY', 'ADMIN', 'WARDEN') AND is_active = TRUE";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int authUserId = rs.getInt("id");
                Notification n = new Notification(0, authUserId, complaintId, "COMPLAINT_ESCALATED", title, body, link, false, "URGENT", null, null);
                notificationDAO.createNotification(n);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error finding authorities for escalation notification", e);
        }
    }

    public Escalation getEscalationById(int id) {
        String sql = getBaseQuery() + " WHERE e.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapEscalation(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalation by ID: " + id, e);
        }
        return null;
    }

    public Escalation getEscalationByNumber(String number) {
        String sql = getBaseQuery() + " WHERE e.escalation_number = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, number);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapEscalation(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalation by number: " + number, e);
        }
        return null;
    }

    public Escalation getEscalationByComplaintId(int complaintId) {
        String sql = getBaseQuery() + " WHERE e.complaint_id = ? ORDER BY e.created_at DESC LIMIT 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapEscalation(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalation by complaint ID: " + complaintId, e);
        }
        return null;
    }

    public List<Escalation> getEscalationsByStudentId(int studentUserId) {
        List<Escalation> list = new ArrayList<>();
        String sql = getBaseQuery() + 
                     " WHERE c.user_id = ? OR e.raised_by = ? OR e.escalated_by = ? " +
                     " ORDER BY e.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, studentUserId);
            ps.setInt(2, studentUserId);
            ps.setInt(3, studentUserId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapEscalation(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching student escalations: " + studentUserId, e);
        }
        return list;
    }

    public List<Escalation> getAllEscalations(String statusFilter) {
        List<Escalation> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(getBaseQuery());
        if (ValidationUtil.isNotEmpty(statusFilter)) {
            sql.append(" WHERE e.status = ?");
        }
        sql.append(" ORDER BY e.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            if (ValidationUtil.isNotEmpty(statusFilter)) {
                ps.setString(1, statusFilter);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapEscalation(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalations", e);
        }
        return list;
    }

    public boolean resolveEscalation(int escalationId, String actionTaken, int actionByUserId) {
        String sql = "UPDATE escalations SET status = 'RESOLVED', remarks = ?, action_taken = ?, " +
                     "action_by = ?, action_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP, " +
                     "updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, actionTaken);
            ps.setString(2, actionTaken);
            ps.setInt(3, actionByUserId);
            ps.setInt(4, escalationId);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error resolving escalation ID: " + escalationId, e);
        }
        return false;
    }

    public int getPendingEscalationsCount() {
        String sql = "SELECT COUNT(*) FROM escalations WHERE status IN ('PENDING_REVIEW', 'UNDER_REVIEW')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting pending escalations", e);
        }
        return 0;
    }

    private String getBaseQuery() {
        return "SELECT e.id, e.escalation_number, e.complaint_id, c.complaint_number, " +
               "c.title AS complaint_title, e.raised_by, e.from_authority, e.to_authority, " +
               "e.escalated_by, u.full_name AS escalated_by_name, " +
               "e.escalation_type, e.reason, e.status, e.remarks, e.response_deadline, " +
               "e.action_taken, e.action_by, ab.full_name AS action_by_name, " +
               "e.action_at, e.resolved_at, e.created_at, e.updated_at " +
               "FROM escalations e " +
               "JOIN complaints c ON e.complaint_id = c.id " +
               "LEFT JOIN users u ON COALESCE(e.raised_by, e.escalated_by) = u.id " +
               "LEFT JOIN users ab ON e.action_by = ab.id";
    }

    private Escalation mapEscalation(ResultSet rs) throws SQLException {
        Escalation e = new Escalation();
        e.setId(rs.getInt("id"));
        e.setEscalationNumber(rs.getString("escalation_number"));
        e.setComplaintId(rs.getInt("complaint_id"));
        e.setComplaintNumber(rs.getString("complaint_number"));
        e.setComplaintTitle(rs.getString("complaint_title"));
        
        int rBy = rs.getInt("raised_by");
        if (rs.wasNull()) {
            rBy = rs.getInt("escalated_by");
        }
        e.setRaisedBy(rBy);
        e.setEscalatedBy(rBy);
        e.setFromAuthority(rs.getString("from_authority"));
        e.setToAuthority(rs.getString("to_authority"));

        e.setEscalatedByName(rs.getString("escalated_by_name"));
        e.setEscalationType(rs.getString("escalation_type"));
        e.setReason(rs.getString("reason"));
        e.setStatus(rs.getString("status"));
        
        String rem = rs.getString("remarks");
        if (rem == null || rem.isEmpty()) {
            rem = rs.getString("action_taken");
        }
        e.setRemarks(rem);
        e.setActionTaken(rem);

        e.setResponseDeadline(rs.getTimestamp("response_deadline"));
        e.setActionBy(rs.getObject("action_by") != null ? rs.getInt("action_by") : null);
        e.setActionByName(rs.getString("action_by_name"));
        e.setActionAt(rs.getTimestamp("action_at"));
        e.setResolvedAt(rs.getTimestamp("resolved_at"));
        e.setCreatedAt(rs.getTimestamp("created_at"));
        e.setUpdatedAt(rs.getTimestamp("updated_at"));
        return e;
    }
}
