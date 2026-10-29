package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Category;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.ComplaintEvidence;
import com.campusnexa.model.ComplaintStatusHistory;
import com.campusnexa.model.Facility;
import com.campusnexa.model.Hostel;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Complaints, Categories, Hostels, Facilities, and Lifecycle Tracking.
 */
public class ComplaintDAO {

    private static final Logger LOGGER = Logger.getLogger(ComplaintDAO.class.getName());

    /**
     * Retrieve all active complaint categories with SLA definitions.
     */
    public List<Category> getAllCategories() {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT id, code, name, icon, default_sla_hours, description FROM complaint_categories ORDER BY id ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(new Category(
                        rs.getInt("id"),
                        rs.getString("code"),
                        rs.getString("name"),
                        rs.getString("icon"),
                        rs.getInt("default_sla_hours"),
                        rs.getString("description")
                ));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching categories", e);
        }
        return list;
    }

    /**
     * Retrieve all campus hostels.
     */
    public List<Hostel> getAllHostels() {
        List<Hostel> list = new ArrayList<>();
        String sql = "SELECT id, name, type, capacity FROM hostels ORDER BY id ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(new Hostel(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("type"),
                        rs.getInt("capacity")
                ));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching hostels", e);
        }
        return list;
    }

    /**
     * Retrieve all campus facilities.
     */
    public List<Facility> getAllFacilities() {
        List<Facility> list = new ArrayList<>();
        String sql = "SELECT id, name, location_details, in_charge_name FROM facilities ORDER BY id ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(new Facility(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("location_details"),
                        rs.getString("in_charge_name")
                ));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching facilities", e);
        }
        return list;
    }

    /**
     * Fetch student dashboard statistics directly from MySQL.
     */
    public Map<String, Integer> getStudentStats(int userId) {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("total", 0);
        stats.put("pending", 0);
        stats.put("inProgress", 0);
        stats.put("resolved", 0);
        stats.put("escalated", 0);

        String sql = "SELECT " +
                "COUNT(*) AS total_count, " +
                "SUM(CASE WHEN status IN ('SUBMITTED', 'UNDER_REVIEW') THEN 1 ELSE 0 END) AS pending_count, " +
                "SUM(CASE WHEN status IN ('ASSIGNED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS in_progress_count, " +
                "SUM(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 ELSE 0 END) AS resolved_count, " +
                "SUM(CASE WHEN status = 'ESCALATED' THEN 1 ELSE 0 END) AS escalated_count " +
                "FROM complaints WHERE (user_id = ? OR id IN (SELECT complaint_id FROM protected_complaint_identity WHERE student_id = ?))";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("total", rs.getInt("total_count"));
                    stats.put("pending", rs.getInt("pending_count"));
                    stats.put("inProgress", rs.getInt("in_progress_count"));
                    stats.put("resolved", rs.getInt("resolved_count"));
                    stats.put("escalated", rs.getInt("escalated_count"));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching student stats for user: " + userId, e);
        }
        return stats;
    }

    /**
     * Fetch all complaints submitted by a student, including their protected complaints.
     */
    public List<Complaint> getComplaintsByUserId(int userId) {
        List<Complaint> list = new ArrayList<>();
        String sql = getBaseComplaintQuery() + " WHERE (c.user_id = ? OR c.id IN (SELECT complaint_id FROM protected_complaint_identity WHERE student_id = ?)) ORDER BY c.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching complaints for user: " + userId, e);
        }
        return list;
    }

    /**
     * Check if a student is the owner of a protected complaint.
     */
    public boolean isProtectedComplaintOwner(int complaintId, int studentId) {
        String sql = "SELECT 1 FROM protected_complaint_identity WHERE complaint_id = ? AND student_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, complaintId);
            ps.setInt(2, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error verifying protected complaint ownership", e);
        }
        return false;
    }

    /**
     * Fetch a single complaint by its unique database ID.
     */
    public Complaint getComplaintById(int id) {
        String sql = getBaseComplaintQuery() + " WHERE c.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapComplaint(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching complaint by ID: " + id, e);
        }
        return null;
    }

    /**
     * Fetch a single complaint by its public tracking number (e.g. CNX-2026-000001).
     */
    public Complaint getComplaintByNumber(String complaintNumber) {
        String sql = getBaseComplaintQuery() + " WHERE c.complaint_number = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, complaintNumber);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapComplaint(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching complaint by number: " + complaintNumber, e);
        }
        return null;
    }

    /**
     * Fetch all complaints (for Admin or Authority).
     */
    public List<Complaint> getAllComplaints(String statusFilter, String priorityFilter, Integer categoryId) {
        List<Complaint> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(getBaseComplaintQuery()).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (ValidationUtil.isNotEmpty(statusFilter)) {
            sql.append(" AND c.status = ?");
            params.add(statusFilter);
        }
        if (ValidationUtil.isNotEmpty(priorityFilter)) {
            sql.append(" AND c.priority = ?");
            params.add(priorityFilter);
        }
        if (categoryId != null && categoryId > 0) {
            sql.append(" AND c.category_id = ?");
            params.add(categoryId);
        }
        sql.append(" ORDER BY c.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all complaints", e);
        }
        return list;
    }

    /**
     * Fetch complaints assigned to a staff technician.
     */
    public List<Complaint> getComplaintsByStaffId(int staffId) {
        List<Complaint> list = new ArrayList<>();
        String sql = getBaseComplaintQuery() + " WHERE c.assigned_staff_id = ? ORDER BY c.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, staffId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching complaints for staff: " + staffId, e);
        }
        return list;
    }

    /**
     * Get the lifecycle audit timeline of a complaint.
     */
    public List<ComplaintStatusHistory> getTimeline(int complaintId) {
        List<ComplaintStatusHistory> history = new ArrayList<>();
        String sql = "SELECT h.id, h.complaint_id, h.old_status, h.new_status, h.status, h.remarks, h.changed_by, " +
                "COALESCE(u.full_name, u.username) AS changed_by_name, h.created_at " +
                "FROM complaint_status_history h " +
                "LEFT JOIN users u ON h.changed_by = u.id " +
                "WHERE h.complaint_id = ? ORDER BY h.created_at ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String oldStatus = rs.getString("old_status");
                    String newStatus = rs.getString("new_status");
                    String status = rs.getString("status");
                    if (newStatus == null) newStatus = status;

                    history.add(new ComplaintStatusHistory(
                            rs.getInt("id"),
                            rs.getInt("complaint_id"),
                            oldStatus,
                            newStatus,
                            status,
                            rs.getString("remarks"),
                            rs.getObject("changed_by") != null ? rs.getInt("changed_by") : null,
                            rs.getString("changed_by_name"),
                            rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching timeline for complaint: " + complaintId, e);
        }
        return history;
    }

    /**
     * Persist a new complaint with transactional integrity, SLA calculation, and audit logging.
     */
    public boolean createComplaint(Complaint complaint, String clientIp) {
        String seqSql = "SELECT COALESCE(MAX(id), 0) + 1 AS next_seq FROM complaints FOR UPDATE";
        String catSql = "SELECT default_sla_hours FROM complaint_categories WHERE id = ?";
        String insertSql = "INSERT INTO complaints (" +
                "complaint_number, user_id, category_id, sub_category, hostel_id, facility_id, " +
                "building, room_number, location, title, description, priority, status, " +
                "is_protected, protection_reason, visibility, sla_deadline, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                "VALUES (?, NULL, 'SUBMITTED', 'SUBMITTED', 'Complaint registered via CampusNexa Portal', ?, CURRENT_TIMESTAMP)";

        String protectedSql = "INSERT INTO protected_complaint_identity (complaint_id, student_id, confidential_alias, created_at) " +
                "VALUES (?, ?, ?, CURRENT_TIMESTAMP)";

        String auditSql = "INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) " +
                "VALUES (?, 'COMPLAINT_CREATED', ?, ?, CURRENT_TIMESTAMP)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Determine next sequence ID and generate formatted complaint number
            int nextSeq = 1;
            try (PreparedStatement psSeq = conn.prepareStatement(seqSql);
                 ResultSet rsSeq = psSeq.executeQuery()) {
                if (rsSeq.next()) {
                    nextSeq = rsSeq.getInt("next_seq");
                }
            }
            String complaintNum = ValidationUtil.generateComplaintNumber(nextSeq);
            complaint.setComplaintNumber(complaintNum);

            // 2. Compute SLA target resolution deadline
            int slaHours = 24;
            try (PreparedStatement psCat = conn.prepareStatement(catSql)) {
                psCat.setInt(1, complaint.getCategoryId());
                try (ResultSet rsCat = psCat.executeQuery()) {
                    if (rsCat.next()) {
                        slaHours = rsCat.getInt("default_sla_hours");
                    }
                }
            }

            // Adjust SLA for priority
            String pri = complaint.getPriority() != null ? complaint.getPriority().toUpperCase() : "MEDIUM";
            if ("CRITICAL".equals(pri)) {
                slaHours = Math.max(2, slaHours / 2);
            } else if ("HIGH".equals(pri)) {
                slaHours = Math.max(4, (int)(slaHours * 0.75));
            } else if ("LOW".equals(pri)) {
                slaHours = (int)(slaHours * 1.5);
            }

            long deadlineMillis = System.currentTimeMillis() + (slaHours * 3600000L);
            Timestamp slaDeadline = new Timestamp(deadlineMillis);
            complaint.setSlaDeadline(slaDeadline);

            boolean isProt = complaint.isProtected() || "PROTECTED".equalsIgnoreCase(complaint.getVisibility());
            complaint.setProtected(isProt);
            String visibility = isProt ? "PROTECTED" : "STANDARD";
            complaint.setVisibility(visibility);

            // 3. Insert Complaint
            int generatedId;
            try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, complaintNum);
                ps.setInt(2, complaint.getUserId());
                ps.setInt(3, complaint.getCategoryId());
                ps.setString(4, complaint.getSubCategory());
                if (complaint.getHostelId() != null && complaint.getHostelId() > 0) {
                    ps.setInt(5, complaint.getHostelId());
                } else {
                    ps.setNull(5, Types.INTEGER);
                }
                if (complaint.getFacilityId() != null && complaint.getFacilityId() > 0) {
                    ps.setInt(6, complaint.getFacilityId());
                } else {
                    ps.setNull(6, Types.INTEGER);
                }
                ps.setString(7, complaint.getBuilding());
                ps.setString(8, complaint.getRoomNumber());
                ps.setString(9, complaint.getLocation());
                ps.setString(10, complaint.getTitle());
                ps.setString(11, complaint.getDescription());
                ps.setString(12, pri);
                ps.setString(13, "SUBMITTED");
                ps.setBoolean(14, isProt);
                ps.setString(15, complaint.getProtectionReason());
                ps.setString(16, visibility);
                ps.setTimestamp(17, slaDeadline);

                int rows = ps.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return false;
                }
                try (ResultSet gk = ps.getGeneratedKeys()) {
                    if (gk.next()) {
                        generatedId = gk.getInt(1);
                        complaint.setId(generatedId);
                    } else {
                        conn.rollback();
                        return false;
                    }
                }
            }

            // 4. Insert Initial Status History
            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, generatedId);
                if (isProt) {
                    psHist.setNull(2, Types.INTEGER);
                } else {
                    psHist.setInt(2, complaint.getUserId());
                }
                psHist.executeUpdate();
            }

            // 5. If Protected, Insert Identity Mask Record
            if (isProt) {
                try (PreparedStatement psProt = conn.prepareStatement(protectedSql)) {
                    psProt.setInt(1, generatedId);
                    psProt.setInt(2, complaint.getUserId());
                    psProt.setString(3, "PROTECTED_COMPLAINANT_" + generatedId);
                    psProt.executeUpdate();
                }
            }

            // 6. Insert Audit Log
            try (PreparedStatement psAudit = conn.prepareStatement(auditSql)) {
                psAudit.setInt(1, complaint.getUserId());
                psAudit.setString(2, "Created ticket " + complaintNum + " (" + complaint.getTitle() + ")");
                psAudit.setString(3, clientIp != null ? clientIp : "127.0.0.1");
                psAudit.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to create complaint", e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { /* ignored */ }
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) { /* ignored */ }
            }
        }
    }

    /**
     * Updates complaint status with history trail, recording old_status, new_status, and audit log.
     */
    public boolean updateStatus(int complaintId, String newStatus, String remarks, int changedByUserId) {
        String selectOldSql = "SELECT status FROM complaints WHERE id = ? FOR UPDATE";
        String updateSql = "UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP, " +
                "work_started_at = CASE WHEN ? = 'IN_PROGRESS' AND work_started_at IS NULL THEN CURRENT_TIMESTAMP ELSE work_started_at END, " +
                "resolved_at = CASE WHEN ? = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END, " +
                "closed_at = CASE WHEN ? = 'CLOSED' THEN CURRENT_TIMESTAMP ELSE closed_at END " +
                "WHERE id = ?";

        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

        String auditSql = "INSERT INTO audit_logs (user_id, action, details, created_at) " +
                "VALUES (?, 'STATUS_UPDATED', ?, CURRENT_TIMESTAMP)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String oldStatus = null;
            try (PreparedStatement psSelect = conn.prepareStatement(selectOldSql)) {
                psSelect.setInt(1, complaintId);
                try (ResultSet rs = psSelect.executeQuery()) {
                    if (rs.next()) {
                        oldStatus = rs.getString("status");
                    } else {
                        conn.rollback();
                        return false;
                    }
                }
            }

            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                ps.setString(1, newStatus);
                ps.setString(2, newStatus);
                ps.setString(3, newStatus);
                ps.setString(4, newStatus);
                ps.setInt(5, complaintId);
                ps.executeUpdate();
            }

            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, complaintId);
                psHist.setString(2, oldStatus);
                psHist.setString(3, newStatus);
                psHist.setString(4, newStatus);
                psHist.setString(5, remarks != null ? remarks : "Status updated to " + newStatus);
                psHist.setInt(6, changedByUserId);
                psHist.executeUpdate();
            }

            try (PreparedStatement psAudit = conn.prepareStatement(auditSql)) {
                psAudit.setInt(1, changedByUserId);
                psAudit.setString(2, "Complaint ID " + complaintId + " transitioned from " + oldStatus + " to " + newStatus);
                psAudit.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating complaint status", e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { /* ignored */ }
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) { /* ignored */ }
            }
        }
    }

    /**
     * Retrieve resolution remarks and resolver details for a complaint.
     */
    public Map<String, Object> getResolutionDetails(int complaintId) {
        Map<String, Object> details = new HashMap<>();
        String sql = "SELECT h.remarks, h.created_at, COALESCE(u.full_name, u.username) AS resolver_name, " +
                "u.role AS resolver_role " +
                "FROM complaint_status_history h " +
                "LEFT JOIN users u ON h.changed_by = u.id " +
                "WHERE h.complaint_id = ? AND (h.new_status = 'RESOLVED' OR h.status = 'RESOLVED') " +
                "ORDER BY h.created_at DESC LIMIT 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    details.put("resolutionRemarks", rs.getString("remarks"));
                    details.put("resolvedAt", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toString() : "");
                    details.put("resolvedByName", rs.getString("resolver_name"));
                    details.put("resolverRole", rs.getString("resolver_role"));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching resolution details for complaint: " + complaintId, e);
        }
        return details;
    }

    public List<Complaint> searchComplaints(String query) {
        List<Complaint> list = new ArrayList<>();
        if (!ValidationUtil.isNotEmpty(query)) {
            return getAllComplaints(null, null, null);
        }
        String sql = getBaseComplaintQuery() + " WHERE LOWER(c.complaint_number) LIKE ? OR LOWER(c.title) LIKE ? " +
                     "OR LOWER(c.description) LIKE ? OR LOWER(c.location) LIKE ? ORDER BY c.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + query.trim().toLowerCase() + "%";
            ps.setString(1, term);
            ps.setString(2, term);
            ps.setString(3, term);
            ps.setString(4, term);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching complaints with query: " + query, e);
        }
        return list;
    }

    public boolean deleteComplaint(int id) {
        String deleteHistory = "DELETE FROM complaint_status_history WHERE complaint_id = ?";
        String deleteProtected = "DELETE FROM protected_complaint_identity WHERE complaint_id = ?";
        String deleteAssignments = "DELETE FROM complaint_assignments WHERE complaint_id = ?";
        String deleteMessages = "DELETE FROM authority_messages WHERE complaint_id = ?";
        String deleteFeedback = "DELETE FROM feedback WHERE complaint_id = ?";
        String deleteEscalations = "DELETE FROM escalations WHERE complaint_id = ?";
        String deleteComplaint = "DELETE FROM complaints WHERE id = ?";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(deleteHistory)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(deleteProtected)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(deleteAssignments)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(deleteMessages)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(deleteFeedback)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(deleteEscalations)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }
            int rows;
            try (PreparedStatement ps = conn.prepareStatement(deleteComplaint)) {
                ps.setInt(1, id);
                rows = ps.executeUpdate();
            }

            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting complaint ID: " + id, e);
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

    private String getBaseComplaintQuery() {
        return "SELECT c.id, c.complaint_number, c.user_id, u.username AS student_username, " +
                "u.full_name AS student_full_name, c.category_id, cat.code AS category_code, " +
                "cat.name AS category_name, cat.icon AS category_icon, c.sub_category, " +
                "c.hostel_id, h.name AS hostel_name, c.facility_id, f.name AS facility_name, " +
                "c.building, c.room_number, c.location, c.title, c.description, c.priority, " +
                "c.status, c.is_protected, c.protection_reason, c.visibility, c.assigned_staff_id, " +
                "s.full_name AS assigned_staff_name, c.assigned_by, c.assigned_at, " +
                "c.work_started_at, c.resolved_at, c.closed_at, c.sla_deadline, c.is_overdue, " +
                "c.created_at, c.updated_at " +
                "FROM complaints c " +
                "JOIN users u ON c.user_id = u.id " +
                "JOIN complaint_categories cat ON c.category_id = cat.id " +
                "LEFT JOIN hostels h ON c.hostel_id = h.id " +
                "LEFT JOIN facilities f ON c.facility_id = f.id " +
                "LEFT JOIN users s ON c.assigned_staff_id = s.id";
    }

    private Complaint mapComplaint(ResultSet rs) throws SQLException {
        Complaint c = new Complaint();
        c.setId(rs.getInt("id"));
        c.setComplaintNumber(rs.getString("complaint_number"));
        c.setUserId(rs.getInt("user_id"));
        c.setStudentUsername(rs.getString("student_username"));
        c.setStudentFullName(rs.getString("student_full_name"));
        c.setCategoryId(rs.getInt("category_id"));
        c.setCategoryCode(rs.getString("category_code"));
        c.setCategoryName(rs.getString("category_name"));
        c.setCategoryIcon(rs.getString("category_icon"));
        c.setSubCategory(rs.getString("sub_category"));
        c.setHostelId(rs.getObject("hostel_id") != null ? rs.getInt("hostel_id") : null);
        c.setHostelName(rs.getString("hostel_name"));
        c.setFacilityId(rs.getObject("facility_id") != null ? rs.getInt("facility_id") : null);
        c.setFacilityName(rs.getString("facility_name"));
        c.setBuilding(rs.getString("building"));
        c.setRoomNumber(rs.getString("room_number"));
        c.setLocation(rs.getString("location"));
        c.setTitle(rs.getString("title"));
        c.setDescription(rs.getString("description"));
        c.setPriority(rs.getString("priority"));
        c.setStatus(rs.getString("status"));
        c.setProtected(rs.getBoolean("is_protected"));
        c.setProtectionReason(rs.getString("protection_reason"));
        c.setVisibility(rs.getString("visibility") != null ? rs.getString("visibility") : (c.isProtected() ? "PROTECTED" : "STANDARD"));
        c.setAssignedStaffId(rs.getObject("assigned_staff_id") != null ? rs.getInt("assigned_staff_id") : null);
        c.setAssignedStaffName(rs.getString("assigned_staff_name"));
        c.setAssignedBy(rs.getObject("assigned_by") != null ? rs.getInt("assigned_by") : null);
        c.setAssignedAt(rs.getTimestamp("assigned_at"));
        c.setWorkStartedAt(rs.getTimestamp("work_started_at"));
        c.setResolvedAt(rs.getTimestamp("resolved_at"));
        c.setClosedAt(rs.getTimestamp("closed_at"));
        c.setSlaDeadline(rs.getTimestamp("sla_deadline"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        c.setUpdatedAt(rs.getTimestamp("updated_at"));

        // Phase 15: Configurable Response & Resolution Monitoring Calculations
        int[] benchmarks = EscalationRuleDAO.getExpectedHoursBenchmark(c.getCategoryName(), c.getPriority());
        int expResponseHours = benchmarks[0];
        int expResolutionHours = benchmarks[1];
        c.setExpectedResponseHours(expResponseHours);
        c.setExpectedResolutionHours(expResolutionHours);

        Timestamp createdAt = c.getCreatedAt();
        Timestamp assignedAt = c.getAssignedAt();
        Timestamp workStartedAt = c.getWorkStartedAt();
        Timestamp resolvedAt = c.getResolvedAt();
        long now = System.currentTimeMillis();

        if (createdAt != null) {
            Timestamp firstResponse = assignedAt != null ? assignedAt : workStartedAt;
            if (firstResponse != null) {
                long respDiffSec = Math.max(0, (firstResponse.getTime() - createdAt.getTime()) / 1000);
                c.setResponseTimeSeconds(respDiffSec);
                c.setResponseTimeFormatted(EscalationRuleDAO.formatDuration(respDiffSec));
                if (respDiffSec > (long) expResponseHours * 3600) {
                    c.setResponseOverdue(true);
                }
            } else {
                long elapsedRespSec = Math.max(0, (now - createdAt.getTime()) / 1000);
                c.setResponseTimeFormatted("Pending (" + EscalationRuleDAO.formatDuration(elapsedRespSec) + " elapsed)");
                if (!"RESOLVED".equalsIgnoreCase(c.getStatus()) && !"CLOSED".equalsIgnoreCase(c.getStatus()) && !"REJECTED".equalsIgnoreCase(c.getStatus())) {
                    if (elapsedRespSec > (long) expResponseHours * 3600) {
                        c.setResponseOverdue(true);
                    }
                }
            }

            if (resolvedAt != null) {
                long resolDiffSec = Math.max(0, (resolvedAt.getTime() - createdAt.getTime()) / 1000);
                c.setResolutionTimeSeconds(resolDiffSec);
                c.setResolutionTimeFormatted(EscalationRuleDAO.formatDuration(resolDiffSec));
                if (resolDiffSec > (long) expResolutionHours * 3600) {
                    c.setResolutionOverdue(true);
                }
            } else {
                long elapsedResolSec = Math.max(0, (now - createdAt.getTime()) / 1000);
                c.setResolutionTimeFormatted("Ongoing (" + EscalationRuleDAO.formatDuration(elapsedResolSec) + " elapsed)");
                if (!"RESOLVED".equalsIgnoreCase(c.getStatus()) && !"CLOSED".equalsIgnoreCase(c.getStatus()) && !"REJECTED".equalsIgnoreCase(c.getStatus())) {
                    if (elapsedResolSec > (long) expResolutionHours * 3600) {
                        c.setResolutionOverdue(true);
                    }
                }
            }
        }

        boolean dbOverdue = rs.getBoolean("is_overdue");
        boolean slaBreached = (c.getSlaDeadline() != null && c.getSlaDeadline().getTime() < now &&
                !"RESOLVED".equalsIgnoreCase(c.getStatus()) && !"CLOSED".equalsIgnoreCase(c.getStatus()) && !"REJECTED".equalsIgnoreCase(c.getStatus()));

        boolean isOverallOverdue = dbOverdue || slaBreached || c.isResponseOverdue() || c.isResolutionOverdue();
        c.setOverdue(isOverallOverdue);

        if (c.isResponseOverdue() && c.isResolutionOverdue()) {
            c.setOverdueReason(String.format("Response (>%dh) & Resolution (>%dh) overdue", expResponseHours, expResolutionHours));
        } else if (c.isResponseOverdue()) {
            c.setOverdueReason(String.format("Response overdue: unaddressed past %dh target", expResponseHours));
        } else if (c.isResolutionOverdue()) {
            c.setOverdueReason(String.format("Resolution overdue: ongoing past %dh target", expResolutionHours));
        } else if (slaBreached) {
            c.setOverdueReason("SLA deadline exceeded");
        } else {
            c.setOverdueReason(null);
        }

        return c;
    }

    /**
     * Retrieve all evidence files uploaded for a complaint.
     */
    public List<ComplaintEvidence> getEvidenceByComplaintId(int complaintId) {
        List<ComplaintEvidence> list = new ArrayList<>();
        String sql = "SELECT id, complaint_id, file_name, file_path, file_type, file_size_bytes, stage, uploaded_by, created_at " +
                "FROM complaint_evidence WHERE complaint_id = ? ORDER BY created_at ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new ComplaintEvidence(
                            rs.getInt("id"),
                            rs.getInt("complaint_id"),
                            rs.getString("file_name"),
                            rs.getString("file_path"),
                            rs.getString("file_type"),
                            rs.getLong("file_size_bytes"),
                            rs.getString("stage"),
                            rs.getInt("uploaded_by"),
                            rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching evidence for complaint ID: " + complaintId, e);
        }
        return list;
    }

    /**
     * Persist uploaded complaint evidence/photograph into MySQL.
     */
    public boolean addEvidence(int complaintId, String fileName, String filePath, String fileType, long fileSize, int uploadedBy) {
        String sql = "INSERT INTO complaint_evidence (" +
                "complaint_id, file_name, file_path, file_type, file_size_bytes, stage, uploaded_by, created_at) " +
                "VALUES (?, ?, ?, ?, ?, 'SUBMISSION', ?, CURRENT_TIMESTAMP)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            ps.setString(2, fileName);
            ps.setString(3, filePath);
            ps.setString(4, fileType);
            ps.setLong(5, fileSize);
            ps.setInt(6, uploadedBy);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting complaint evidence for complaint: " + complaintId, e);
        }
        return false;
    }

    /**
     * Fetch Warden Dashboard Real-Time KPI Stats across MySQL complaints.
     */
    public Map<String, Integer> getWardenStats() {
        Map<String, Integer> map = new HashMap<>();
        map.put("newComplaints", 0);
        map.put("pendingReview", 0);
        map.put("assigned", 0);
        map.put("inProgress", 0);
        map.put("overdue", 0);
        map.put("escalated", 0);
        map.put("resolved", 0);

        String sql = "SELECT " +
                "COUNT(CASE WHEN c.status = 'SUBMITTED' THEN 1 END) AS new_complaints, " +
                "COUNT(CASE WHEN c.status = 'UNDER_REVIEW' THEN 1 END) AS pending_review, " +
                "COUNT(CASE WHEN c.status = 'ASSIGNED' THEN 1 END) AS assigned, " +
                "COUNT(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 END) AS in_progress, " +
                "COUNT(CASE WHEN (c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')) AND (" +
                "   c.is_overdue = 1 OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                "   OR (c.assigned_at IS NULL AND c.work_started_at IS NULL AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 1 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 2 WHEN cat.name LIKE '%Clean%' THEN 2 WHEN cat.name LIKE '%Elect%' THEN 3 WHEN cat.name LIKE '%Water%' THEN 3 ELSE 6 END)) " +
                "   OR (TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 4 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 6 WHEN cat.name LIKE '%Clean%' THEN 8 WHEN cat.name LIKE '%Elect%' THEN 12 WHEN cat.name LIKE '%Water%' THEN 12 ELSE 24 END))" +
                ") THEN 1 END) AS overdue, " +
                "COUNT(CASE WHEN c.status = 'ESCALATED' THEN 1 END) AS escalated, " +
                "COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved " +
                "FROM complaints c LEFT JOIN complaint_categories cat ON c.category_id = cat.id";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                map.put("newComplaints", rs.getInt("new_complaints"));
                map.put("pendingReview", rs.getInt("pending_review"));
                map.put("assigned", rs.getInt("assigned"));
                map.put("inProgress", rs.getInt("in_progress"));
                map.put("overdue", rs.getInt("overdue"));
                map.put("escalated", rs.getInt("escalated"));
                map.put("resolved", rs.getInt("resolved"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching warden stats", e);
        }
        return map;
    }

    /**
     * Fetch complaints for the Warden Dashboard corresponding to sidebar filters.
     */
    public List<Complaint> getWardenComplaints(String filter, String search) {
        List<Complaint> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(getBaseComplaintQuery()).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (ValidationUtil.isNotEmpty(filter)) {
            String f = filter.trim().toUpperCase();
            switch (f) {
                case "INCOMING":
                case "SUBMITTED":
                    sql.append(" AND c.status = 'SUBMITTED'");
                    break;
                case "PENDING_REVIEW":
                case "UNDER_REVIEW":
                    sql.append(" AND c.status = 'UNDER_REVIEW'");
                    break;
                case "ASSIGNED":
                case "ASSIGNED_COMPLAINTS":
                    sql.append(" AND c.status = 'ASSIGNED'");
                    break;
                case "IN_PROGRESS":
                    sql.append(" AND c.status = 'IN_PROGRESS'");
                    break;
                case "OVERDUE":
                    sql.append(" AND (c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')) AND (" +
                            "c.is_overdue = 1 OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                            "OR (c.assigned_at IS NULL AND c.work_started_at IS NULL AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 1 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 2 WHEN cat.name LIKE '%Clean%' THEN 2 WHEN cat.name LIKE '%Elect%' THEN 3 WHEN cat.name LIKE '%Water%' THEN 3 ELSE 6 END)) " +
                            "OR (TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 4 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 6 WHEN cat.name LIKE '%Clean%' THEN 8 WHEN cat.name LIKE '%Elect%' THEN 12 WHEN cat.name LIKE '%Water%' THEN 12 ELSE 24 END))" +
                            ")");
                    break;
                case "ESCALATED":
                    sql.append(" AND c.status = 'ESCALATED'");
                    break;
                case "HOSTEL":
                case "HOSTEL_COMPLAINTS":
                    sql.append(" AND (c.hostel_id IS NOT NULL OR cat.code = 'BUILDINGS_ROOMS' OR cat.code = 'FURNITURE' OR cat.code = 'AC_VENTILATION')");
                    break;
                case "MESS":
                case "MESS_COMPLAINTS":
                    sql.append(" AND (cat.code = 'MESS_FOOD' OR LOWER(cat.name) LIKE '%mess%' OR LOWER(cat.name) LIKE '%food%')");
                    break;
                case "CLEANING":
                case "CLEANING_COMPLAINTS":
                    sql.append(" AND (cat.code = 'CLEANING_SANITATION' OR LOWER(cat.name) LIKE '%clean%' OR LOWER(cat.name) LIKE '%sanitation%')");
                    break;
                case "HISTORY":
                case "COMPLAINT_HISTORY":
                    sql.append(" AND c.status IN ('RESOLVED', 'CLOSED', 'REJECTED')");
                    break;
                case "DASHBOARD":
                case "ALL":
                default:
                    // Show all complaints
                    break;
            }
        }

        if (ValidationUtil.isNotEmpty(search)) {
            String term = "%" + search.trim().toLowerCase() + "%";
            sql.append(" AND (LOWER(c.complaint_number) LIKE ? OR LOWER(c.title) LIKE ? OR LOWER(c.description) LIKE ? OR LOWER(c.location) LIKE ? OR LOWER(c.building) LIKE ? OR LOWER(c.room_number) LIKE ?)");
            for (int i = 0; i < 6; i++) {
                params.add(term);
            }
        }

        sql.append(" ORDER BY c.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching warden complaints with filter: " + filter, e);
        }
        return list;
    }

    /**
     * Authority action: Update complaint priority with audit log and status history.
     */
    public boolean updatePriority(int complaintId, String newPriority, String remarks, int changedByUserId) {
        String updateSql = "UPDATE complaints SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                "SELECT id, status, status, status, ?, ?, CURRENT_TIMESTAMP FROM complaints WHERE id = ?";
        String auditSql = "INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, 'UPDATE_PRIORITY', ?, CURRENT_TIMESTAMP)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                ps.setString(1, newPriority.toUpperCase());
                ps.setInt(2, complaintId);
                int rows = ps.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return false;
                }
            }

            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                String logRemarks = "Priority updated to " + newPriority.toUpperCase() + (ValidationUtil.isNotEmpty(remarks) ? ": " + remarks : "");
                psHist.setString(1, logRemarks);
                psHist.setInt(2, changedByUserId);
                psHist.setInt(3, complaintId);
                psHist.executeUpdate();
            }

            try (PreparedStatement psAudit = conn.prepareStatement(auditSql)) {
                psAudit.setInt(1, changedByUserId);
                psAudit.setString(2, "Changed priority of complaint #" + complaintId + " to " + newPriority.toUpperCase());
                psAudit.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating priority for complaint ID: " + complaintId, e);
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

    /**
     * Fetch Higher Authority Dashboard Real-Time KPI Stats across MySQL complaints & escalations.
     */
    public Map<String, Integer> getHigherAuthorityStats() {
        Map<String, Integer> map = new HashMap<>();
        map.put("totalEscalations", 0);
        map.put("pendingReview", 0);
        map.put("criticalIssues", 0);
        map.put("protectedComplaints", 0);
        map.put("overdue", 0);
        map.put("resolved", 0);

        String sql = "SELECT " +
                "(SELECT COUNT(*) FROM escalations) AS total_escalations, " +
                "(SELECT COUNT(*) FROM complaints WHERE status = 'UNDER_REVIEW') AS pending_review, " +
                "(SELECT COUNT(*) FROM complaints WHERE priority = 'CRITICAL' AND status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')) AS critical_issues, " +
                "(SELECT COUNT(*) FROM complaints WHERE is_protected = 1 OR visibility = 'PROTECTED') AS protected_complaints, " +
                "(SELECT COUNT(*) FROM complaints c LEFT JOIN complaint_categories cat ON c.category_id = cat.id WHERE c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') AND (" +
                "   c.is_overdue = 1 OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                "   OR (c.assigned_at IS NULL AND c.work_started_at IS NULL AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 1 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 2 WHEN cat.name LIKE '%Clean%' THEN 2 WHEN cat.name LIKE '%Elect%' THEN 3 WHEN cat.name LIKE '%Water%' THEN 3 ELSE 6 END)) " +
                "   OR (TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 4 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 6 WHEN cat.name LIKE '%Clean%' THEN 8 WHEN cat.name LIKE '%Elect%' THEN 12 WHEN cat.name LIKE '%Water%' THEN 12 ELSE 24 END))" +
                ")) AS overdue, " +
                "(SELECT COUNT(*) FROM complaints WHERE status IN ('RESOLVED', 'CLOSED')) AS resolved";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                map.put("totalEscalations", rs.getInt("total_escalations"));
                map.put("pendingReview", rs.getInt("pending_review"));
                map.put("criticalIssues", rs.getInt("critical_issues"));
                map.put("protectedComplaints", rs.getInt("protected_complaints"));
                map.put("overdue", rs.getInt("overdue"));
                map.put("resolved", rs.getInt("resolved"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching higher authority stats", e);
        }
        return map;
    }

    /**
     * Retrieve all active overdue grievances across campus for administrator and authority monitoring.
     */
    public List<Complaint> getOverdueComplaints() {
        return getWardenComplaints("OVERDUE", null);
    }

    /**
     * Fetch complaints for the Higher Authority / COE Dashboard corresponding to sidebar filters.
     */
    public List<Complaint> getHigherAuthorityComplaints(String filter, String search) {
        List<Complaint> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(getBaseComplaintQuery()).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (ValidationUtil.isNotEmpty(filter)) {
            String f = filter.trim().toUpperCase();
            switch (f) {
                case "ESCALATED":
                case "ESCALATED_COMPLAINTS":
                    sql.append(" AND (c.status = 'ESCALATED' OR EXISTS (SELECT 1 FROM escalations e WHERE e.complaint_id = c.id))");
                    break;
                case "PROTECTED":
                case "PROTECTED_COMPLAINTS":
                    sql.append(" AND (c.is_protected = 1 OR c.visibility = 'PROTECTED')");
                    break;
                case "HOSTEL":
                case "HOSTEL_ISSUES":
                    sql.append(" AND (c.hostel_id IS NOT NULL OR cat.code = 'BUILDING_ROOMS' OR cat.code = 'FURNITURE_INFRA' OR cat.code = 'AC_VENTILATION')");
                    break;
                case "MESS":
                case "MESS_FOOD":
                case "MESS_ISSUES":
                    sql.append(" AND (cat.code = 'MESS_FOOD' OR LOWER(cat.name) LIKE '%mess%' OR LOWER(cat.name) LIKE '%food%')");
                    break;
                case "CLEANING":
                case "CLEANING_ISSUES":
                    sql.append(" AND (cat.code = 'CLEANING_SANITATION' OR LOWER(cat.name) LIKE '%clean%' OR LOWER(cat.name) LIKE '%sanitation%')");
                    break;
                case "RECURRING":
                case "RECURRING_PROBLEMS":
                    sql.append(" AND ((c.building IS NOT NULL AND c.building != '' AND c.building IN (SELECT building FROM complaints WHERE building IS NOT NULL AND building != '' GROUP BY building HAVING COUNT(*) > 1)) " +
                            "OR (c.hostel_id IS NOT NULL AND c.hostel_id IN (SELECT hostel_id FROM complaints WHERE hostel_id IS NOT NULL GROUP BY hostel_id HAVING COUNT(*) > 1)) " +
                            "OR LOWER(c.title) LIKE '%repeated%' OR LOWER(c.description) LIKE '%repeated%' OR LOWER(c.protection_reason) LIKE '%repeated%' " +
                            "OR LOWER(c.title) LIKE '%recurring%' OR LOWER(c.description) LIKE '%recurring%' OR LOWER(c.protection_reason) LIKE '%recurring%')");
                    break;
                case "CRITICAL":
                case "CRITICAL_ISSUES":
                    sql.append(" AND c.priority = 'CRITICAL' AND c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')");
                    break;
                case "OVERDUE":
                    sql.append(" AND (c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')) AND (" +
                            "c.is_overdue = 1 OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                            "OR (c.assigned_at IS NULL AND c.work_started_at IS NULL AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 1 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 2 WHEN cat.name LIKE '%Clean%' THEN 2 WHEN cat.name LIKE '%Elect%' THEN 3 WHEN cat.name LIKE '%Water%' THEN 3 ELSE 6 END)) " +
                            "OR (TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) >= (CASE WHEN c.priority = 'CRITICAL' THEN 4 WHEN cat.name LIKE '%Food%' OR cat.name LIKE '%Mess%' THEN 6 WHEN cat.name LIKE '%Clean%' THEN 8 WHEN cat.name LIKE '%Elect%' THEN 12 WHEN cat.name LIKE '%Water%' THEN 12 ELSE 24 END))" +
                            ")");
                    break;
                case "PENDING_REVIEW":
                    sql.append(" AND c.status = 'UNDER_REVIEW'");
                    break;
                case "RESOLVED":
                    sql.append(" AND c.status IN ('RESOLVED', 'CLOSED')");
                    break;
                case "HISTORY":
                case "COMPLAINT_HISTORY":
                    sql.append(" AND c.status IN ('RESOLVED', 'CLOSED', 'REJECTED')");
                    break;
                case "DASHBOARD":
                case "ALL":
                default:
                    // Show all complaints under institutional review
                    break;
            }
        }

        if (ValidationUtil.isNotEmpty(search)) {
            String term = "%" + search.trim().toLowerCase() + "%";
            sql.append(" AND (LOWER(c.complaint_number) LIKE ? OR LOWER(c.title) LIKE ? OR LOWER(c.description) LIKE ? OR LOWER(c.location) LIKE ? OR LOWER(c.building) LIKE ? OR LOWER(c.room_number) LIKE ?)");
            for (int i = 0; i < 6; i++) {
                params.add(term);
            }
        }

        sql.append(" ORDER BY c.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapComplaint(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching higher authority complaints with filter: " + filter, e);
        }
        return list;
    }

    /**
     * Executive action taken by Higher Authority / COE.
     * Resolves escalations, issues institutional directives, updates status, and logs audit trail.
     */
    public boolean recordHigherAuthorityAction(int complaintId, Integer escalationId, String actionType,
                                               String actionDetails, String newStatus, int userId) {
        String fetchCurrentStatusSql = "SELECT status FROM complaints WHERE id = ?";
        String updateEscalationSql = "UPDATE escalations SET status = 'ACTION_TAKEN', action_taken = ?, " +
                "action_by = ?, action_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP " +
                "WHERE (id = ? OR (complaint_id = ? AND status = 'PENDING_REVIEW'))";
        String updateComplaintSql;
        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            updateComplaintSql = "UPDATE complaints SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        } else if ("CLOSED".equalsIgnoreCase(newStatus)) {
            updateComplaintSql = "UPDATE complaints SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        } else if ("IN_PROGRESS".equalsIgnoreCase(newStatus)) {
            updateComplaintSql = "UPDATE complaints SET status = 'IN_PROGRESS', work_started_at = COALESCE(work_started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        } else if (ValidationUtil.isNotEmpty(newStatus)) {
            updateComplaintSql = "UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        } else {
            updateComplaintSql = "UPDATE complaints SET updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        }

        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        String auditSql = "INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, 'HIGHER_AUTHORITY_DIRECTIVE', ?, CURRENT_TIMESTAMP)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String oldStatus = "SUBMITTED";
            try (PreparedStatement psFetch = conn.prepareStatement(fetchCurrentStatusSql)) {
                psFetch.setInt(1, complaintId);
                try (ResultSet rs = psFetch.executeQuery()) {
                    if (rs.next()) {
                        oldStatus = rs.getString("status");
                    }
                }
            }

            String effectiveNewStatus = ValidationUtil.isNotEmpty(newStatus) ? newStatus.toUpperCase() : oldStatus;

            String escStatus = "RESOLVED".equalsIgnoreCase(newStatus) ? "RESOLVED" : "ACTION_TAKEN";
            String updateEscalationStmt = "UPDATE escalations SET status = '" + escStatus + "', remarks = ?, action_taken = ?, " +
                    "action_by = ?, action_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP " +
                    "WHERE (id = ? OR (complaint_id = ? AND status IN ('PENDING_REVIEW', 'UNDER_REVIEW', 'ACTION_TAKEN')))";

            // 1. Resolve escalation if applicable
            try (PreparedStatement psEsc = conn.prepareStatement(updateEscalationStmt)) {
                String fullAction = "[" + (ValidationUtil.isNotEmpty(actionType) ? actionType : "EXECUTIVE_DIRECTIVE") + "] " + actionDetails;
                psEsc.setString(1, fullAction);
                psEsc.setString(2, fullAction);
                psEsc.setInt(3, userId);
                psEsc.setInt(4, escalationId != null ? escalationId : 0);
                psEsc.setInt(5, complaintId);
                psEsc.executeUpdate();
            }

            // 2. Update complaint status
            try (PreparedStatement psComp = conn.prepareStatement(updateComplaintSql)) {
                if ("RESOLVED".equalsIgnoreCase(newStatus) || "CLOSED".equalsIgnoreCase(newStatus) || !ValidationUtil.isNotEmpty(newStatus)) {
                    psComp.setInt(1, complaintId);
                } else {
                    psComp.setString(1, effectiveNewStatus);
                    psComp.setInt(2, complaintId);
                }
                psComp.executeUpdate();
            }

            // 3. Status History
            String directiveRemarks = "Higher Authority Directive (" + (ValidationUtil.isNotEmpty(actionType) ? actionType : "EXECUTIVE_ACTION") + "): " + actionDetails;
            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, complaintId);
                psHist.setString(2, oldStatus);
                psHist.setString(3, effectiveNewStatus);
                psHist.setString(4, effectiveNewStatus);
                psHist.setString(5, directiveRemarks);
                psHist.setInt(6, userId);
                psHist.executeUpdate();
            }

            // 4. Audit Log
            try (PreparedStatement psAudit = conn.prepareStatement(auditSql)) {
                psAudit.setInt(1, userId);
                psAudit.setString(2, "Complaint #" + complaintId + " directive: " + actionType + " -> " + actionDetails);
                psAudit.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error recording higher authority action on complaint: " + complaintId, e);
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
}
