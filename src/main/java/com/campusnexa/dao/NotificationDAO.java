package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Notification;
import com.campusnexa.model.NotificationType;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for enterprise database-backed notifications.
 * Manages full persistence, retrieval, status lifecycle, and broadcast alerts.
 */
public class NotificationDAO {

    private static final Logger LOGGER = Logger.getLogger(NotificationDAO.class.getName());
    private static volatile boolean tableInitialized = false;

    public NotificationDAO() {
        ensureSchema();
    }

    /**
     * Idempotently verifies and upgrades the MySQL notifications schema.
     */
    public synchronized void ensureSchema() {
        if (tableInitialized) return;

        String createTableSql = "CREATE TABLE IF NOT EXISTS notifications (" +
                "id INT PRIMARY KEY AUTO_INCREMENT, " +
                "recipient_user_id INT NOT NULL, " +
                "user_id INT NOT NULL, " +
                "complaint_id INT NULL, " +
                "notification_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM_ALERT', " +
                "title VARCHAR(200) NOT NULL, " +
                "message TEXT NOT NULL, " +
                "link_url VARCHAR(255) NULL, " +
                "is_read BOOLEAN NOT NULL DEFAULT FALSE, " +
                "priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "read_at TIMESTAMP NULL, " +
                "INDEX idx_notif_recipient (recipient_user_id), " +
                "INDEX idx_notif_user (user_id), " +
                "INDEX idx_notif_type (notification_type), " +
                "INDEX idx_notif_complaint (complaint_id), " +
                "INDEX idx_notif_read (is_read), " +
                "INDEX idx_notif_created (created_at)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute(createTableSql);

            // Add missing columns if upgrading from legacy notifications table
            addColumnIfNotExists(conn, "notifications", "recipient_user_id", "INT NULL");
            addColumnIfNotExists(conn, "notifications", "complaint_id", "INT NULL");
            addColumnIfNotExists(conn, "notifications", "notification_type", "VARCHAR(50) NOT NULL DEFAULT 'SYSTEM_ALERT'");
            addColumnIfNotExists(conn, "notifications", "priority", "VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'");
            addColumnIfNotExists(conn, "notifications", "read_at", "TIMESTAMP NULL");

            // Sync recipient_user_id with user_id for any null rows
            stmt.executeUpdate("UPDATE notifications SET recipient_user_id = user_id WHERE recipient_user_id IS NULL OR recipient_user_id = 0");

            tableInitialized = true;
            LOGGER.info("NotificationDAO: Database notifications schema verified successfully.");
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "NotificationDAO schema check note: " + e.getMessage());
        }
    }

    private void addColumnIfNotExists(Connection conn, String table, String column, String definition) {
        try {
            DatabaseMetaData md = conn.getMetaData();
            try (ResultSet rs = md.getColumns(null, null, table, column)) {
                if (!rs.next()) {
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
                        LOGGER.info("Added column " + column + " to table " + table);
                    }
                }
            }
        } catch (SQLException ignored) {
            // Column may already exist or ALTER not permitted
        }
    }

    /**
     * Persists a notification record to MySQL.
     */
    public boolean createNotification(Notification notif) {
        if (notif == null) return false;

        int recipientId = notif.getRecipientUserId() > 0 ? notif.getRecipientUserId() : notif.getUserId();
        if (recipientId <= 0) {
            LOGGER.warning("Cannot create notification without a valid recipient user ID");
            return false;
        }

        String notifType = notif.getNotificationType() != null ? notif.getNotificationType() : NotificationType.SYSTEM_ALERT;
        String priority = notif.getPriority() != null ? notif.getPriority() : "MEDIUM";
        String title = notif.getTitle() != null ? notif.getTitle().trim() : "Notification";
        String message = notif.getMessage() != null ? notif.getMessage().trim() : "";

        String sql = "INSERT INTO notifications (recipient_user_id, user_id, complaint_id, notification_type, " +
                "title, message, link_url, is_read, priority, created_at, read_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, recipientId);
            ps.setInt(2, recipientId);
            if (notif.getComplaintId() != null && notif.getComplaintId() > 0) {
                ps.setInt(3, notif.getComplaintId());
            } else {
                ps.setNull(3, Types.INTEGER);
            }
            ps.setString(4, notifType);
            ps.setString(5, title);
            ps.setString(6, message);
            ps.setString(7, notif.getLinkUrl());
            ps.setBoolean(8, notif.isRead());
            ps.setString(9, priority);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        notif.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating notification for recipient: " + recipientId, e);
        }
        return false;
    }

    /**
     * Retrieves paginated notifications for a user.
     */
    public List<Notification> getNotificationsByUser(int userId, int limit, int offset) {
        List<Notification> list = new ArrayList<>();
        if (userId <= 0) return list;
        if (limit <= 0) limit = 50;
        if (offset < 0) offset = 0;

        String sql = "SELECT id, recipient_user_id, user_id, complaint_id, notification_type, " +
                "title, message, link_url, is_read, priority, created_at, read_at " +
                "FROM notifications WHERE (recipient_user_id = ? OR user_id = ?) " +
                "ORDER BY created_at DESC LIMIT ? OFFSET ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, limit);
            ps.setInt(4, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapNotification(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching paginated notifications for user: " + userId, e);
        }
        return list;
    }

    /**
     * Retrieves latest 50 notifications for a user (backward-compatible).
     */
    public List<Notification> getNotificationsByUserId(int userId) {
        return getNotificationsByUser(userId, 50, 0);
    }

    /**
     * Retrieves unread notifications for a user.
     */
    public List<Notification> getUnreadNotificationsByUserId(int userId) {
        List<Notification> list = new ArrayList<>();
        if (userId <= 0) return list;

        String sql = "SELECT id, recipient_user_id, user_id, complaint_id, notification_type, " +
                "title, message, link_url, is_read, priority, created_at, read_at " +
                "FROM notifications WHERE (recipient_user_id = ? OR user_id = ?) AND is_read = FALSE " +
                "ORDER BY created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapNotification(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching unread notifications for user: " + userId, e);
        }
        return list;
    }

    /**
     * Returns total unread notification count for a user.
     */
    public int getUnreadCount(int userId) {
        if (userId <= 0) return 0;
        String sql = "SELECT COUNT(*) FROM notifications WHERE (recipient_user_id = ? OR user_id = ?) AND is_read = FALSE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting unread notifications for user: " + userId, e);
        }
        return 0;
    }

    /**
     * Marks a specific notification as read, enforcing user ownership.
     */
    public boolean markAsRead(int notificationId, int userId) {
        String sql = "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP " +
                "WHERE id = ? AND (recipient_user_id = ? OR user_id = ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking notification " + notificationId + " read for user " + userId, e);
        }
        return false;
    }

    /**
     * Marks a specific notification as read (legacy overload).
     */
    public boolean markAsRead(int notificationId) {
        String sql = "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking notification as read: " + notificationId, e);
        }
        return false;
    }

    /**
     * Marks all unread notifications for a user as read.
     */
    public boolean markAllAsRead(int userId) {
        String sql = "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP " +
                "WHERE (recipient_user_id = ? OR user_id = ?) AND is_read = FALSE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            return ps.executeUpdate() >= 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking all notifications read for user: " + userId, e);
        }
        return false;
    }

    /**
     * Retrieves a single notification by ID.
     */
    public Notification getNotificationById(int notificationId) {
        String sql = "SELECT id, recipient_user_id, user_id, complaint_id, notification_type, " +
                "title, message, link_url, is_read, priority, created_at, read_at " +
                "FROM notifications WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapNotification(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching notification by ID: " + notificationId, e);
        }
        return null;
    }

    /**
     * Retrieves a single notification by ID ensuring user ownership.
     */
    public Notification getNotificationById(int notificationId, int userId) {
        String sql = "SELECT id, recipient_user_id, user_id, complaint_id, notification_type, " +
                "title, message, link_url, is_read, priority, created_at, read_at " +
                "FROM notifications WHERE id = ? AND (recipient_user_id = ? OR user_id = ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapNotification(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching notification ID " + notificationId + " for user " + userId, e);
        }
        return null;
    }

    /**
     * Deletes a notification by ID (legacy overload).
     */
    public boolean deleteNotification(int id) {
        String sql = "DELETE FROM notifications WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting notification ID: " + id, e);
        }
        return false;
    }

    /**
     * Deletes a notification ensuring user ownership.
     */
    public boolean deleteNotification(int id, int userId) {
        String sql = "DELETE FROM notifications WHERE id = ? AND (recipient_user_id = ? OR user_id = ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting notification ID " + id + " for user " + userId, e);
        }
        return false;
    }

    /**
     * Broadcasts a system alert to all users matching specified roles (or all active users).
     */
    public int broadcastSystemAlert(String title, String message, String priority, List<String> targetRoles) {
        StringBuilder userQuery = new StringBuilder("SELECT id FROM users WHERE is_active = TRUE");
        if (targetRoles != null && !targetRoles.isEmpty()) {
            userQuery.append(" AND role IN (");
            for (int i = 0; i < targetRoles.size(); i++) {
                userQuery.append("?");
                if (i < targetRoles.size() - 1) userQuery.append(",");
            }
            userQuery.append(")");
        }

        int count = 0;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement psUsers = conn.prepareStatement(userQuery.toString())) {

            if (targetRoles != null && !targetRoles.isEmpty()) {
                for (int i = 0; i < targetRoles.size(); i++) {
                    psUsers.setString(i + 1, targetRoles.get(i).trim());
                }
            }

            List<Integer> recipientIds = new ArrayList<>();
            try (ResultSet rs = psUsers.executeQuery()) {
                while (rs.next()) {
                    recipientIds.add(rs.getInt("id"));
                }
            }

            for (int rId : recipientIds) {
                Notification notif = new Notification(
                        0, rId, null, NotificationType.SYSTEM_ALERT,
                        title, message, "/student-dashboard.html#notifications",
                        false, priority != null ? priority : "HIGH", null, null
                );
                if (createNotification(notif)) {
                    count++;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error broadcasting system alert", e);
        }
        return count;
    }

    private Notification mapNotification(ResultSet rs) throws SQLException {
        Notification n = new Notification();
        n.setId(rs.getInt("id"));

        int rId = 0;
        try {
            rId = rs.getInt("recipient_user_id");
        } catch (SQLException ignored) {}
        if (rId == 0) {
            rId = rs.getInt("user_id");
        }
        n.setRecipientUserId(rId);
        n.setUserId(rId);

        try {
            int compId = rs.getInt("complaint_id");
            if (!rs.wasNull()) {
                n.setComplaintId(compId);
            }
        } catch (SQLException ignored) {}

        try {
            String type = rs.getString("notification_type");
            if (type != null && !type.isEmpty()) {
                n.setNotificationType(type);
            }
        } catch (SQLException ignored) {}

        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        n.setLinkUrl(rs.getString("link_url"));
        n.setRead(rs.getBoolean("is_read"));

        try {
            String prio = rs.getString("priority");
            if (prio != null && !prio.isEmpty()) {
                n.setPriority(prio);
            }
        } catch (SQLException ignored) {}

        n.setCreatedAt(rs.getTimestamp("created_at"));

        try {
            n.setReadAt(rs.getTimestamp("read_at"));
        } catch (SQLException ignored) {}

        return n;
    }
}
