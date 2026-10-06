package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.AuditLog;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for security, authentication, and operational audit trails.
 */
public class AuditLogDAO {

    private static final Logger LOGGER = Logger.getLogger(AuditLogDAO.class.getName());

    public boolean logAction(Integer userId, String action, String details, String ipAddress) {
        String sql = "INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            if (userId != null && userId > 0) {
                ps.setInt(1, userId);
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, action != null ? action.trim() : "UNKNOWN_ACTION");
            ps.setString(3, details != null ? details.trim() : "");
            ps.setString(4, ipAddress != null ? ipAddress.trim() : "127.0.0.1");

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating audit log entry for action: " + action, e);
        }
        return false;
    }

    public List<AuditLog> getRecentLogs(int limit) {
        List<AuditLog> list = new ArrayList<>();
        int fetchLimit = limit > 0 ? limit : 50;
        String sql = getBaseQuery() + " ORDER BY a.created_at DESC LIMIT ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, fetchLimit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAuditLog(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching recent audit logs", e);
        }
        return list;
    }

    public List<AuditLog> getLogsByUser(int userId, int limit) {
        List<AuditLog> list = new ArrayList<>();
        int fetchLimit = limit > 0 ? limit : 50;
        String sql = getBaseQuery() + " WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, fetchLimit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAuditLog(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching audit logs for user: " + userId, e);
        }
        return list;
    }

    public List<AuditLog> searchLogs(String query, int limit) {
        List<AuditLog> list = new ArrayList<>();
        if (!ValidationUtil.isNotEmpty(query)) {
            return getRecentLogs(limit);
        }
        int fetchLimit = limit > 0 ? limit : 50;
        String sql = getBaseQuery() + " WHERE LOWER(a.action) LIKE ? OR LOWER(a.details) LIKE ? OR LOWER(u.username) LIKE ? " +
                     "ORDER BY a.created_at DESC LIMIT ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + query.trim().toLowerCase() + "%";
            ps.setString(1, term);
            ps.setString(2, term);
            ps.setString(3, term);
            ps.setInt(4, fetchLimit);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAuditLog(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching audit logs for query: " + query, e);
        }
        return list;
    }

    private String getBaseQuery() {
        return "SELECT a.id, a.user_id, u.username, a.action, a.details, a.ip_address, a.created_at " +
               "FROM audit_logs a " +
               "LEFT JOIN users u ON a.user_id = u.id";
    }

    private AuditLog mapAuditLog(ResultSet rs) throws SQLException {
        AuditLog l = new AuditLog();
        l.setId(rs.getInt("id"));
        l.setUserId(rs.getObject("user_id") != null ? rs.getInt("user_id") : null);
        l.setUsername(rs.getString("username"));
        l.setAction(rs.getString("action"));
        l.setDetails(rs.getString("details"));
        l.setIpAddress(rs.getString("ip_address"));
        l.setCreatedAt(rs.getTimestamp("created_at"));
        return l;
    }
}
