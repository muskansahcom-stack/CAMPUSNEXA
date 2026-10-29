package com.campusnexa.model;

import java.sql.Timestamp;

/**
 * Enterprise Model representing database-backed notifications.
 * Supports Phase 19 complaint lifecycle events, digital communications, and system alerts.
 */
public class Notification {

    private int id;
    private int recipientUserId;
    private int userId; // Kept in sync with recipientUserId for backward compatibility
    private Integer complaintId;
    private String notificationType;
    private String title;
    private String message;
    private String linkUrl;
    private boolean isRead;
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private Timestamp createdAt;
    private Timestamp readAt;

    public Notification() {
        this.notificationType = "SYSTEM_ALERT";
        this.priority = "MEDIUM";
        this.isRead = false;
    }

    /**
     * Legacy backward-compatible constructor
     */
    public Notification(int id, int userId, String title, String message, String linkUrl, boolean isRead, Timestamp createdAt) {
        this.id = id;
        this.recipientUserId = userId;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.linkUrl = linkUrl;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.notificationType = "SYSTEM_ALERT";
        this.priority = "MEDIUM";
    }

    /**
     * Full Phase 19 constructor
     */
    public Notification(int id, int recipientUserId, Integer complaintId, String notificationType,
                        String title, String message, String linkUrl, boolean isRead,
                        String priority, Timestamp createdAt, Timestamp readAt) {
        this.id = id;
        this.recipientUserId = recipientUserId;
        this.userId = recipientUserId;
        this.complaintId = complaintId;
        this.notificationType = notificationType != null ? notificationType : "SYSTEM_ALERT";
        this.title = title;
        this.message = message;
        this.linkUrl = linkUrl;
        this.isRead = isRead;
        this.priority = priority != null ? priority : "MEDIUM";
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getNotificationId() { return id; }
    public void setNotificationId(int notificationId) { this.id = notificationId; }

    public int getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(int recipientUserId) {
        this.recipientUserId = recipientUserId;
        this.userId = recipientUserId;
    }

    public int getUserId() { return userId; }
    public void setUserId(int userId) {
        this.userId = userId;
        this.recipientUserId = userId;
    }

    public Integer getComplaintId() { return complaintId; }
    public void setComplaintId(Integer complaintId) { this.complaintId = complaintId; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType != null ? notificationType.trim().toUpperCase() : "SYSTEM_ALERT";
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) {
        this.priority = priority != null ? priority.trim().toUpperCase() : "MEDIUM";
    }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getReadAt() { return readAt; }
    public void setReadAt(Timestamp readAt) { this.readAt = readAt; }
}
