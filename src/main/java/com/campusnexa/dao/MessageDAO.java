package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Message;
import com.campusnexa.model.Notification;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for digital 2-way communications between students and campus authorities.
 * Supports enterprise tracking, read receipts, and whistleblower identity preservation.
 */
public class MessageDAO {

    private static final Logger LOGGER = Logger.getLogger(MessageDAO.class.getName());
    private final NotificationDAO notificationDAO = new NotificationDAO();

    public boolean sendMessage(Message msg) {
        String sql = "INSERT INTO authority_messages (" +
                "complaint_id, sender_id, recipient_id, sender_role, receiver_role, " +
                "message_text, message, is_protected_sender, is_read, read_status, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, 0, CURRENT_TIMESTAMP)";

        String receiverRole = msg.getReceiverRole();
        if (receiverRole == null || receiverRole.trim().isEmpty()) {
            if ("STUDENT".equalsIgnoreCase(msg.getSenderRole())) {
                receiverRole = "AUTHORITY";
            } else {
                receiverRole = "STUDENT";
            }
            msg.setReceiverRole(receiverRole);
        }

        String content = msg.getMessage();
        if (content == null || content.trim().isEmpty()) {
            content = msg.getMessageText();
        }
        if (content == null) {
            content = "";
        }
        content = content.trim();
        msg.setMessage(content);
        msg.setMessageText(content);

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, msg.getComplaintId());
            ps.setInt(2, msg.getSenderId());
            if (msg.getRecipientId() != null && msg.getRecipientId() > 0) {
                ps.setInt(3, msg.getRecipientId());
            } else {
                ps.setNull(3, Types.INTEGER);
            }
            ps.setString(4, msg.getSenderRole() != null ? msg.getSenderRole() : "STUDENT");
            ps.setString(5, receiverRole);
            ps.setString(6, content);
            ps.setString(7, content);
            ps.setBoolean(8, msg.isProtectedSender());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        msg.setId(rs.getInt(1));
                    }
                }

                // Dispatch real-time notification
                dispatchNotification(msg);
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting message for complaint: " + msg.getComplaintId(), e);
        }
        return false;
    }

    private void dispatchNotification(Message msg) {
        String findComplaintSql = "SELECT c.id, c.complaint_number, c.user_id, c.is_protected, c.visibility, " +
                                  "c.assigned_staff_id, c.hostel_id " +
                                  "FROM complaints c WHERE c.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(findComplaintSql)) {

            ps.setInt(1, msg.getComplaintId());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int studentUserId = rs.getInt("user_id");
                    String complaintNumber = rs.getString("complaint_number");
                    boolean isProtected = rs.getBoolean("is_protected") || 
                                          "PROTECTED".equalsIgnoreCase(rs.getString("visibility"));
                    Integer assignedStaffId = rs.getObject("assigned_staff_id") != null ? 
                                              rs.getInt("assigned_staff_id") : null;

                    String snippet = msg.getMessage();
                    if (snippet.length() > 60) {
                        snippet = snippet.substring(0, 57) + "...";
                    }

                    if ("STUDENT".equalsIgnoreCase(msg.getSenderRole())) {
                        // Student -> Authority notification
                        String notifTitle = isProtected ? 
                                "New message on Protected Complaint #" + complaintNumber :
                                "New message on #" + complaintNumber;
                        String notifBody = isProtected ?
                                "Complainant sent an inquiry regarding protected ticket #" + complaintNumber :
                                "Student sent inquiry on #" + complaintNumber + ": \"" + snippet + "\"";
                        String notifLink = "/authority-dashboard.html#communication";

                        // Notify assigned staff if available
                        if (assignedStaffId != null && assignedStaffId > 0) {
                            Notification staffNotif = new Notification(0, assignedStaffId, msg.getComplaintId(), "AUTHORITY_MESSAGE", notifTitle, notifBody, notifLink, false, "MEDIUM", null, null);
                            notificationDAO.createNotification(staffNotif);
                        }

                        // Also notify campus wardens
                        notifyWardens(conn, msg.getComplaintId(), notifTitle, notifBody, notifLink);
                    } else {
                        // Authority -> Student notification
                        String senderRoleLabel = msg.getSenderRole();
                        if ("WARDEN".equalsIgnoreCase(senderRoleLabel) || "DEPUTY_WARDEN".equalsIgnoreCase(senderRoleLabel)) {
                            senderRoleLabel = "Hostel Warden";
                        } else if ("HIGHER_AUTHORITY".equalsIgnoreCase(senderRoleLabel)) {
                            senderRoleLabel = "Higher Authority / COE";
                        } else if ("ADMIN".equalsIgnoreCase(senderRoleLabel)) {
                            senderRoleLabel = "System Administrator";
                        } else if ("STAFF".equalsIgnoreCase(senderRoleLabel)) {
                            senderRoleLabel = "Maintenance Staff";
                        }

                        String notifType = isProtected ? "PROTECTED_RESPONSE" : ("ADMIN".equalsIgnoreCase(msg.getSenderRole()) ? "ADMIN_MESSAGE" : "AUTHORITY_MESSAGE");
                        String notifTitle = isProtected ? "Official Response on Protected #" + complaintNumber : "New official message on #" + complaintNumber;
                        String notifBody = senderRoleLabel + " responded: \"" + snippet + "\"";
                        String notifLink = "/student-dashboard.html#messages";

                        Notification studentNotif = new Notification(0, studentUserId, msg.getComplaintId(), notifType, notifTitle, notifBody, notifLink, false, "MEDIUM", null, null);
                        notificationDAO.createNotification(studentNotif);
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Failed to dispatch message notification for complaint: " + msg.getComplaintId(), e);
        }
    }

    private void notifyWardens(Connection conn, int complaintId, String title, String body, String link) {
        String sql = "SELECT id FROM users WHERE role IN ('WARDEN', 'DEPUTY_WARDEN', 'ADMIN') AND is_active = TRUE";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int wardenId = rs.getInt("id");
                Notification n = new Notification(0, wardenId, complaintId, "AUTHORITY_MESSAGE", title, body, link, false, "MEDIUM", null, null);
                notificationDAO.createNotification(n);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error finding wardens for notification", e);
        }
    }

    public List<Message> getMessagesByComplaintId(int complaintId) {
        List<Message> list = new ArrayList<>();
        String sql = getBaseQuery() + " WHERE m.complaint_id = ? ORDER BY m.created_at ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapMessage(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching messages for complaint: " + complaintId, e);
        }
        return list;
    }

    public List<Message> getMessagesForUser(int userId) {
        List<Message> list = new ArrayList<>();
        String sql = getBaseQuery() + " WHERE m.recipient_id = ? OR m.sender_id = ? ORDER BY m.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapMessage(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching user messages for: " + userId, e);
        }
        return list;
    }

    public boolean markMessagesAsRead(int complaintId, int readerUserId, String readerRole) {
        String sql;
        if ("STUDENT".equalsIgnoreCase(readerRole)) {
            // Student reads: mark messages from authorities as read
            sql = "UPDATE authority_messages SET is_read = TRUE, read_status = 1 " +
                  "WHERE complaint_id = ? AND sender_role != 'STUDENT'";
        } else {
            // Authority reads: mark messages from students as read
            sql = "UPDATE authority_messages SET is_read = TRUE, read_status = 1 " +
                  "WHERE complaint_id = ? AND sender_role = 'STUDENT'";
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            return ps.executeUpdate() >= 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking messages as read for complaint: " + complaintId, e);
        }
        return false;
    }

    public boolean markAsRead(int messageId) {
        String sql = "UPDATE authority_messages SET is_read = TRUE, read_status = 1 WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, messageId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking message as read: " + messageId, e);
        }
        return false;
    }

    public int getUnreadCount(int userId) {
        String sql = "SELECT COUNT(*) FROM authority_messages WHERE recipient_id = ? AND (is_read = FALSE OR read_status = 0)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting unread messages for: " + userId, e);
        }
        return 0;
    }

    public int getUnreadCountForStudent(int studentUserId) {
        String sql = "SELECT COUNT(*) FROM authority_messages m " +
                     "JOIN complaints c ON m.complaint_id = c.id " +
                     "WHERE c.user_id = ? AND (m.is_read = FALSE OR m.read_status = 0) AND m.sender_role != 'STUDENT'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, studentUserId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting unread messages for student: " + studentUserId, e);
        }
        return 0;
    }

    public int getUnreadCountForAuthority() {
        String sql = "SELECT COUNT(*) FROM authority_messages m " +
                     "WHERE (m.is_read = FALSE OR m.read_status = 0) AND m.sender_role = 'STUDENT'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting unread messages for authority", e);
        }
        return 0;
    }

    public List<Map<String, Object>> getStudentConversations(int studentUserId) {
        List<Map<String, Object>> conversations = new ArrayList<>();
        String sql = "SELECT c.id AS complaint_id, c.complaint_number, c.title, c.status, c.priority, " +
                     "c.is_protected, c.visibility, " +
                     "(SELECT COUNT(*) FROM authority_messages m2 WHERE m2.complaint_id = c.id) AS total_messages, " +
                     "(SELECT COUNT(*) FROM authority_messages m3 WHERE m3.complaint_id = c.id AND (m3.is_read = FALSE OR m3.read_status = 0) AND m3.sender_role != 'STUDENT') AS unread_count, " +
                     "(SELECT m4.message_text FROM authority_messages m4 WHERE m4.complaint_id = c.id ORDER BY m4.created_at DESC LIMIT 1) AS last_message, " +
                     "(SELECT m5.sender_role FROM authority_messages m5 WHERE m5.complaint_id = c.id ORDER BY m5.created_at DESC LIMIT 1) AS last_sender_role, " +
                     "(SELECT m6.created_at FROM authority_messages m6 WHERE m6.complaint_id = c.id ORDER BY m6.created_at DESC LIMIT 1) AS last_message_at " +
                     "FROM complaints c " +
                     "WHERE c.user_id = ? " +
                     "ORDER BY CASE WHEN unread_count > 0 THEN 0 ELSE 1 END, " +
                     "COALESCE(last_message_at, c.created_at) DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, studentUserId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> conv = new HashMap<>();
                    conv.put("complaintId", rs.getInt("complaint_id"));
                    conv.put("complaintNumber", rs.getString("complaint_number"));
                    conv.put("title", rs.getString("title"));
                    conv.put("status", rs.getString("status"));
                    conv.put("priority", rs.getString("priority"));
                    boolean isProt = rs.getBoolean("is_protected") || "PROTECTED".equalsIgnoreCase(rs.getString("visibility"));
                    conv.put("isProtected", isProt);
                    conv.put("totalMessages", rs.getInt("total_messages"));
                    conv.put("unreadCount", rs.getInt("unread_count"));
                    conv.put("lastMessage", rs.getString("last_message"));
                    conv.put("lastSenderRole", rs.getString("last_sender_role"));
                    Timestamp ts = rs.getTimestamp("last_message_at");
                    conv.put("lastMessageAt", ts != null ? ts.toString() : null);
                    conversations.add(conv);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching student conversations for: " + studentUserId, e);
        }
        return conversations;
    }

    public List<Map<String, Object>> getAuthorityConversations() {
        List<Map<String, Object>> conversations = new ArrayList<>();
        String sql = "SELECT c.id AS complaint_id, c.complaint_number, c.title, c.status, c.priority, " +
                     "c.is_protected, c.visibility, u.full_name AS student_name, " +
                     "(SELECT COUNT(*) FROM authority_messages m2 WHERE m2.complaint_id = c.id) AS total_messages, " +
                     "(SELECT COUNT(*) FROM authority_messages m3 WHERE m3.complaint_id = c.id AND (m3.is_read = FALSE OR m3.read_status = 0) AND m3.sender_role = 'STUDENT') AS unread_count, " +
                     "(SELECT m4.message_text FROM authority_messages m4 WHERE m4.complaint_id = c.id ORDER BY m4.created_at DESC LIMIT 1) AS last_message, " +
                     "(SELECT m5.sender_role FROM authority_messages m5 WHERE m5.complaint_id = c.id ORDER BY m5.created_at DESC LIMIT 1) AS last_sender_role, " +
                     "(SELECT m6.created_at FROM authority_messages m6 WHERE m6.complaint_id = c.id ORDER BY m6.created_at DESC LIMIT 1) AS last_message_at " +
                     "FROM complaints c " +
                     "JOIN users u ON c.user_id = u.id " +
                     "ORDER BY CASE WHEN unread_count > 0 THEN 0 ELSE 1 END, " +
                     "COALESCE(last_message_at, c.created_at) DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> conv = new HashMap<>();
                conv.put("complaintId", rs.getInt("complaint_id"));
                conv.put("complaintNumber", rs.getString("complaint_number"));
                conv.put("title", rs.getString("title"));
                conv.put("status", rs.getString("status"));
                conv.put("priority", rs.getString("priority"));
                boolean isProt = rs.getBoolean("is_protected") || "PROTECTED".equalsIgnoreCase(rs.getString("visibility"));
                conv.put("isProtected", isProt);
                conv.put("studentName", isProt ? "Identity: 🔒 PROTECTED" : rs.getString("student_name"));
                conv.put("totalMessages", rs.getInt("total_messages"));
                conv.put("unreadCount", rs.getInt("unread_count"));
                conv.put("lastMessage", rs.getString("last_message"));
                conv.put("lastSenderRole", rs.getString("last_sender_role"));
                Timestamp ts = rs.getTimestamp("last_message_at");
                conv.put("lastMessageAt", ts != null ? ts.toString() : null);
                conversations.add(conv);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching authority conversations", e);
        }
        return conversations;
    }

    private String getBaseQuery() {
        return "SELECT m.id, m.complaint_id, c.complaint_number, m.sender_id, " +
               "u.full_name AS sender_name, m.recipient_id, ru.full_name AS recipient_name, " +
               "m.sender_role, m.receiver_role, m.message_text, m.message, " +
               "m.is_protected_sender, m.is_read, m.read_status, m.created_at " +
               "FROM authority_messages m " +
               "JOIN complaints c ON m.complaint_id = c.id " +
               "JOIN users u ON m.sender_id = u.id " +
               "LEFT JOIN users ru ON m.recipient_id = ru.id";
    }

    private Message mapMessage(ResultSet rs) throws SQLException {
        Message m = new Message();
        m.setId(rs.getInt("id"));
        m.setComplaintId(rs.getInt("complaint_id"));
        m.setComplaintNumber(rs.getString("complaint_number"));
        m.setSenderId(rs.getInt("sender_id"));
        m.setSenderName(rs.getString("sender_name"));
        m.setRecipientId(rs.getObject("recipient_id") != null ? rs.getInt("recipient_id") : null);
        m.setRecipientName(rs.getString("recipient_name"));
        m.setSenderRole(rs.getString("sender_role"));
        m.setReceiverRole(rs.getString("receiver_role"));
        
        String txt = rs.getString("message");
        if (txt == null || txt.isEmpty()) {
            txt = rs.getString("message_text");
        }
        m.setMessage(txt);
        m.setMessageText(txt);

        m.setProtectedSender(rs.getBoolean("is_protected_sender"));
        m.setRead(rs.getBoolean("is_read") || rs.getBoolean("read_status"));
        m.setReadStatus(rs.getBoolean("read_status") || rs.getBoolean("is_read"));
        m.setCreatedAt(rs.getTimestamp("created_at"));
        return m;
    }
}
