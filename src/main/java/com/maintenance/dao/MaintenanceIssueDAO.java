package com.maintenance.dao;

import com.maintenance.config.DBConnection;
import com.maintenance.model.MaintenanceIssue;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for MaintenanceIssue entities.
 */
public class MaintenanceIssueDAO {

    private static final Logger LOGGER = Logger.getLogger(MaintenanceIssueDAO.class.getName());

    /**
     * Creates a new maintenance issue ticket.
     *
     * @param issue the maintenance issue to persist
     * @return true if insertion succeeded; false otherwise
     */
    public boolean createIssue(MaintenanceIssue issue) {
        String sql = "INSERT INTO maintenance_issues (user_id, title, description, location, priority, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, issue.getUserId());
            ps.setString(2, issue.getTitle());
            ps.setString(3, issue.getDescription());
            ps.setString(4, issue.getLocation());
            ps.setString(5, issue.getPriority() != null ? issue.getPriority() : "MEDIUM");
            ps.setString(6, issue.getStatus() != null ? issue.getStatus() : "REPORTED");

            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        issue.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in createIssue", e);
        }
        return false;
    }

    /**
     * Retrieves all maintenance issues across the campus with student details.
     *
     * @return List of all MaintenanceIssue records ordered by creation date descending
     */
    public List<MaintenanceIssue> findAllIssues() {
        List<MaintenanceIssue> issues = new ArrayList<>();
        String sql = "SELECT m.id, m.user_id, m.assigned_staff_id, u.username AS student_username, " +
                     "s.username AS staff_username, m.title, m.description, " +
                     "m.location, m.priority, m.status, m.created_at, m.updated_at " +
                     "FROM maintenance_issues m " +
                     "JOIN users u ON m.user_id = u.id " +
                     "LEFT JOIN users s ON m.assigned_staff_id = s.id " +
                     "ORDER BY m.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                issues.add(mapResultSetToIssue(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findAllIssues", e);
        }
        return issues;
    }

    /**
     * Computes real database statistics for the Admin Dashboard.
     *
     * @return Map containing total, reported, inProgress, resolved, and urgent counts
     */
    public Map<String, Integer> getAdminMetrics() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("total", 0);
        stats.put("reported", 0);
        stats.put("inProgress", 0);
        stats.put("resolved", 0);
        stats.put("urgent", 0);

        String sql = "SELECT " +
                     "COUNT(*) AS total, " +
                     "COALESCE(SUM(CASE WHEN status = 'REPORTED' THEN 1 ELSE 0 END), 0) AS reported, " +
                     "COALESCE(SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END), 0) AS in_progress, " +
                     "COALESCE(SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END), 0) AS resolved, " +
                     "COALESCE(SUM(CASE WHEN priority = 'URGENT' THEN 1 ELSE 0 END), 0) AS urgent " +
                     "FROM maintenance_issues";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                stats.put("total", rs.getInt("total"));
                stats.put("reported", rs.getInt("reported"));
                stats.put("inProgress", rs.getInt("in_progress"));
                stats.put("resolved", rs.getInt("resolved"));
                stats.put("urgent", rs.getInt("urgent"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in getAdminMetrics", e);
        }
        return stats;
    }

    /**
     * Retrieves all maintenance issues submitted by a specific user.
     *
     * @param userId ID of the user whose tickets are being fetched
     * @return List of MaintenanceIssue records submitted by the user
     */
    public List<MaintenanceIssue> findIssuesByUserId(int userId) {
        List<MaintenanceIssue> issues = new ArrayList<>();
        String sql = "SELECT m.id, m.user_id, m.assigned_staff_id, s.username AS staff_username, " +
                     "m.title, m.description, m.location, m.priority, m.status, m.created_at, m.updated_at " +
                     "FROM maintenance_issues m " +
                     "LEFT JOIN users s ON m.assigned_staff_id = s.id " +
                     "WHERE m.user_id = ? ORDER BY m.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    issues.add(mapResultSetToIssue(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findIssuesByUserId for user id: " + userId, e);
        }
        return issues;
    }

    /**
     * Finds a single maintenance issue by its primary key ID with student and staff usernames.
     *
     * @param id unique issue ID
     * @return MaintenanceIssue if found; null otherwise
     */
    public MaintenanceIssue findIssueById(int id) {
        String sql = "SELECT m.id, m.user_id, m.assigned_staff_id, u.username AS student_username, " +
                     "s.username AS staff_username, m.title, m.description, " +
                     "m.location, m.priority, m.status, m.created_at, m.updated_at " +
                     "FROM maintenance_issues m " +
                     "JOIN users u ON m.user_id = u.id " +
                     "LEFT JOIN users s ON m.assigned_staff_id = s.id " +
                     "WHERE m.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToIssue(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findIssueById for issue id: " + id, e);
        }
        return null;
    }

    /**
     * Retrieves all maintenance issues assigned to a specific staff member.
     *
     * @param staffId ID of the staff user
     * @return List of MaintenanceIssue records assigned to the staff member
     */
    public List<MaintenanceIssue> findIssuesByStaffId(int staffId) {
        List<MaintenanceIssue> issues = new ArrayList<>();
        String sql = "SELECT m.id, m.user_id, m.assigned_staff_id, u.username AS student_username, " +
                     "s.username AS staff_username, m.title, m.description, " +
                     "m.location, m.priority, m.status, m.created_at, m.updated_at " +
                     "FROM maintenance_issues m " +
                     "JOIN users u ON m.user_id = u.id " +
                     "LEFT JOIN users s ON m.assigned_staff_id = s.id " +
                     "WHERE m.assigned_staff_id = ? " +
                     "ORDER BY m.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, staffId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    issues.add(mapResultSetToIssue(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findIssuesByStaffId for staff id: " + staffId, e);
        }
        return issues;
    }

    /**
     * Updates an issue's status and assigned staff member. (Admin action)
     * Uses PreparedStatement and updates updated_at automatically.
     *
     * @param issueId ID of the issue to update
     * @param status new status (REPORTED, IN_PROGRESS, RESOLVED, REJECTED)
     * @param assignedStaffId ID of the staff user to assign, or null to unassign
     * @return true if updated successfully; false otherwise
     */
    public boolean updateIssueStatusAndAssignment(int issueId, String status, Integer assignedStaffId) {
        String sql = "UPDATE maintenance_issues SET status = ?, assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            if (assignedStaffId != null && assignedStaffId > 0) {
                ps.setInt(2, assignedStaffId);
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setInt(3, issueId);

            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in updateIssueStatusAndAssignment for issue id: " + issueId, e);
            return false;
        }
    }

    /**
     * Updates an issue's status as a Staff member.
     * Enforces strict transition rules:
     *   REPORTED -> IN_PROGRESS
     *   IN_PROGRESS -> RESOLVED
     * Verifies that the issue is strictly assigned to this staff member.
     *
     * @param issueId issue ID
     * @param staffId staff member user ID
     * @param newStatus requested status
     * @return true if transition valid and updated successfully; false otherwise
     */
    public boolean updateIssueStatusByStaff(int issueId, int staffId, String newStatus) {
        MaintenanceIssue current = findIssueById(issueId);
        if (current == null) {
            LOGGER.warning("Staff status update failed: issue not found id=" + issueId);
            return false;
        }

        if (current.getAssignedStaffId() == null || current.getAssignedStaffId() != staffId) {
            LOGGER.warning("Staff status update denied: issue " + issueId + " not assigned to staff " + staffId);
            return false;
        }

        String curStatus = current.getStatus();
        boolean allowed = false;
        if ("REPORTED".equalsIgnoreCase(curStatus) && "IN_PROGRESS".equalsIgnoreCase(newStatus)) {
            allowed = true;
        } else if ("IN_PROGRESS".equalsIgnoreCase(curStatus) && "RESOLVED".equalsIgnoreCase(newStatus)) {
            allowed = true;
        }

        if (!allowed) {
            LOGGER.warning("Staff status update invalid transition: " + curStatus + " -> " + newStatus);
            return false;
        }

        String sql = "UPDATE maintenance_issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND assigned_staff_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus.toUpperCase());
            ps.setInt(2, issueId);
            ps.setInt(3, staffId);

            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in updateIssueStatusByStaff for issue id: " + issueId, e);
            return false;
        }
    }

    /**
     * Helper method to map a ResultSet row to a MaintenanceIssue object.
     */
    private MaintenanceIssue mapResultSetToIssue(ResultSet rs) throws SQLException {
        MaintenanceIssue issue = new MaintenanceIssue(
                rs.getInt("id"),
                rs.getInt("user_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("location"),
                rs.getString("priority"),
                rs.getString("status"),
                rs.getTimestamp("created_at"),
                rs.getTimestamp("updated_at")
        );

        try {
            int staffId = rs.getInt("assigned_staff_id");
            if (!rs.wasNull()) {
                issue.setAssignedStaffId(staffId);
            }
        } catch (SQLException ignored) {}

        try {
            issue.setStudentUsername(rs.getString("student_username"));
        } catch (SQLException ignored) {}

        try {
            issue.setAssignedStaffUsername(rs.getString("staff_username"));
        } catch (SQLException ignored) {}

        return issue;
    }
}
