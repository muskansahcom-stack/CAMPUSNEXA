package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Assignment;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for complaint assignments to technicians.
 */
public class AssignmentDAO {

    private static final Logger LOGGER = Logger.getLogger(AssignmentDAO.class.getName());

    public boolean createAssignment(Assignment assignment) {
        String getOldStatusSql = "SELECT status FROM complaints WHERE id = ?";
        String insertSql = "INSERT INTO complaint_assignments (complaint_id, staff_id, assigned_by, instructions, status, assigned_at) " +
                           "VALUES (?, ?, ?, ?, 'ASSIGNED', CURRENT_TIMESTAMP)";
        String updateComplaintSql = "UPDATE complaints SET assigned_staff_id = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP, " +
                                    "status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                            "VALUES (?, ?, 'ASSIGNED', 'ASSIGNED', ?, ?, CURRENT_TIMESTAMP)";
        String taskSql = "UPDATE maintenance_staff SET active_tasks = active_tasks + 1 WHERE user_id = ?";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String oldStatus = "SUBMITTED";
            try (PreparedStatement psOld = conn.prepareStatement(getOldStatusSql)) {
                psOld.setInt(1, assignment.getComplaintId());
                try (ResultSet rs = psOld.executeQuery()) {
                    if (rs.next() && rs.getString("status") != null) {
                        oldStatus = rs.getString("status");
                    }
                }
            }

            int assignmentId;
            try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, assignment.getComplaintId());
                ps.setInt(2, assignment.getStaffId());
                ps.setInt(3, assignment.getAssignedBy());
                ps.setString(4, assignment.getInstructions() != null ? assignment.getInstructions() : "Dispatched for inspection and repair");

                int rows = ps.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return false;
                }
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        assignmentId = rs.getInt(1);
                        assignment.setId(assignmentId);
                    } else {
                        conn.rollback();
                        return false;
                    }
                }
            }

            // Update Complaint state
            try (PreparedStatement psComp = conn.prepareStatement(updateComplaintSql)) {
                psComp.setInt(1, assignment.getStaffId());
                psComp.setInt(2, assignment.getAssignedBy());
                psComp.setInt(3, assignment.getComplaintId());
                psComp.executeUpdate();
            }

            // Insert Status History
            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, assignment.getComplaintId());
                psHist.setString(2, oldStatus);
                psHist.setString(3, "Assigned to maintenance technician: " + assignment.getInstructions());
                psHist.setInt(4, assignment.getAssignedBy());
                psHist.executeUpdate();
            }

            // Increment Staff Task Counter
            try (PreparedStatement psTask = conn.prepareStatement(taskSql)) {
                psTask.setInt(1, assignment.getStaffId());
                psTask.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Transaction failed creating assignment for complaint: " + assignment.getComplaintId(), e);
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

    public Assignment getAssignmentById(int id) {
        String sql = getBaseQuery() + " WHERE a.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapAssignment(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching assignment by ID: " + id, e);
        }
        return null;
    }

    public List<Assignment> getAssignmentsByComplaintId(int complaintId) {
        List<Assignment> list = new ArrayList<>();
        String sql = getBaseQuery() + " WHERE a.complaint_id = ? ORDER BY a.assigned_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAssignment(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching assignments for complaint: " + complaintId, e);
        }
        return list;
    }

    public List<Assignment> getAssignmentsByStaffId(int staffId) {
        List<Assignment> list = new ArrayList<>();
        String sql = getBaseQuery() + " WHERE a.staff_id = ? ORDER BY a.assigned_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, staffId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAssignment(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching assignments for staff: " + staffId, e);
        }
        return list;
    }

    public boolean acceptAssignment(int assignmentId) {
        String sql = "UPDATE complaint_assignments SET status = 'IN_PROGRESS', accepted_at = CURRENT_TIMESTAMP WHERE id = ?";
        String updateCompSql = "UPDATE complaints SET status = 'IN_PROGRESS', work_started_at = COALESCE(work_started_at, CURRENT_TIMESTAMP), " +
                "updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT complaint_id FROM complaint_assignments WHERE id = ?)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, assignmentId);
                ps.executeUpdate();
            }

            try (PreparedStatement psComp = conn.prepareStatement(updateCompSql)) {
                psComp.setInt(1, assignmentId);
                psComp.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error accepting assignment ID: " + assignmentId, e);
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

    public boolean completeAssignment(int assignmentId, int staffUserId) {
        String updateAssign = "UPDATE complaint_assignments SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?";
        String updateStaff = "UPDATE maintenance_staff SET active_tasks = GREATEST(0, active_tasks - 1) WHERE user_id = ?";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(updateAssign)) {
                ps.setInt(1, assignmentId);
                ps.executeUpdate();
            }

            try (PreparedStatement psStaff = conn.prepareStatement(updateStaff)) {
                psStaff.setInt(1, staffUserId);
                psStaff.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error completing assignment ID: " + assignmentId, e);
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

    private String getBaseQuery() {
        return "SELECT a.id, a.complaint_id, c.complaint_number, c.title AS complaint_title, " +
               "a.staff_id, s.full_name AS staff_name, a.assigned_by, ab.full_name AS assigned_by_name, " +
               "a.instructions, a.status, a.assigned_at, a.accepted_at, a.completed_at " +
               "FROM complaint_assignments a " +
               "JOIN complaints c ON a.complaint_id = c.id " +
               "JOIN users s ON a.staff_id = s.id " +
               "LEFT JOIN users ab ON a.assigned_by = ab.id";
    }

    private Assignment mapAssignment(ResultSet rs) throws SQLException {
        Assignment a = new Assignment();
        a.setId(rs.getInt("id"));
        a.setComplaintId(rs.getInt("complaint_id"));
        a.setComplaintNumber(rs.getString("complaint_number"));
        a.setComplaintTitle(rs.getString("complaint_title"));
        a.setStaffId(rs.getInt("staff_id"));
        a.setStaffName(rs.getString("staff_name"));
        a.setAssignedBy(rs.getInt("assigned_by"));
        a.setAssignedByName(rs.getString("assigned_by_name"));
        a.setInstructions(rs.getString("instructions"));
        a.setStatus(rs.getString("status"));
        a.setAssignedAt(rs.getTimestamp("assigned_at"));
        a.setAcceptedAt(rs.getTimestamp("accepted_at"));
        a.setCompletedAt(rs.getTimestamp("completed_at"));
        return a;
    }
}
