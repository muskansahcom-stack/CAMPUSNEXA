package com.campusnexa.service;

import com.campusnexa.config.DBConnection;
import com.campusnexa.dao.NotificationDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.Escalation;
import com.campusnexa.model.Notification;
import com.campusnexa.model.NotificationType;
import com.campusnexa.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Enterprise Service Layer responsible for notification business logic.
 * Enforces server-side RBAC, strict protected identity rules, and automated workflow triggers.
 */
public class NotificationService {

    private static final Logger LOGGER = Logger.getLogger(NotificationService.class.getName());
    private final NotificationDAO notificationDAO;

    public NotificationService() {
        this(new NotificationDAO());
    }

    public NotificationService(NotificationDAO notificationDAO) {
        this.notificationDAO = notificationDAO;
    }

    /**
     * Trigger 1: When a student submits a complaint.
     * - Confirms submission to the student.
     * - Notifies relevant authorities/admins while strictly masking protected complaints.
     */
    public void notifyComplaintSubmitted(Complaint complaint, User studentUser) {
        if (complaint == null) return;

        int studentId = complaint.getUserId();
        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();

        // 1. Student Confirmation Notification
        Notification studentNotif = new Notification(
                0, studentId, complaint.getId(), NotificationType.COMPLAINT_SUBMITTED,
                "Complaint Submitted: #" + compNum,
                "Your complaint '" + complaint.getTitle() + "' has been successfully registered and queued for administrative review.",
                "/student-dashboard.html#track-complaint",
                false, complaint.getPriority() != null ? complaint.getPriority() : "MEDIUM",
                null, null
        );
        notificationDAO.createNotification(studentNotif);

        // 2. Determine Notification message for Authorities/Admins
        String authorityTitle;
        String authorityBody;
        if (complaint.isProtected() || "PROTECTED".equalsIgnoreCase(complaint.getVisibility())) {
            // STRICT WHISTLEBLOWER SHIELD: Never reveal student identity
            authorityTitle = "New Protected Complaint #" + compNum;
            authorityBody = "A confidential protected grievance regarding " +
                    (complaint.getCategoryName() != null ? complaint.getCategoryName() : "Campus Facility") +
                    " at " + complaint.getLocation() + " was submitted. Complainant identity is protected.";
        } else {
            String studentName = (studentUser != null && studentUser.getFullName() != null)
                    ? studentUser.getFullName()
                    : "Student";
            authorityTitle = "New Complaint #" + compNum;
            authorityBody = "New complaint submitted by " + studentName + " (#" + compNum + "): '" +
                    complaint.getTitle() + "' at " + complaint.getLocation() + " (Priority: " + complaint.getPriority() + ").";
        }

        // Notify Admins and Wardens
        List<Integer> authorityIds = getAuthorityRecipientUserIds(complaint.getHostelId());
        for (int authId : authorityIds) {
            Notification authNotif = new Notification(
                    0, authId, complaint.getId(), NotificationType.COMPLAINT_SUBMITTED,
                    authorityTitle, authorityBody,
                    "/authority-dashboard.html#incoming",
                    false, complaint.getPriority() != null ? complaint.getPriority() : "MEDIUM",
                    null, null
            );
            notificationDAO.createNotification(authNotif);
        }
    }

    /**
     * Trigger 2: When an authority/admin assigns a maintenance technician.
     * - Notifies the technician with dispatch instructions.
     * - Notifies the complaint owner student.
     */
    public void notifyComplaintAssigned(Complaint complaint, int staffUserId, String instructions) {
        if (complaint == null || staffUserId <= 0) return;

        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();

        // 1. Notify Assigned Technician
        String instrText = (instructions != null && !instructions.trim().isEmpty())
                ? instructions.trim()
                : "Assigned for prompt inspection and repair.";

        Notification staffNotif = new Notification(
                0, staffUserId, complaint.getId(), NotificationType.COMPLAINT_ASSIGNED,
                "New Work Assignment: #" + compNum,
                "You have been assigned to service complaint #" + compNum + " ('" + complaint.getTitle() + "') at " +
                        complaint.getLocation() + ". Instructions: " + instrText + " (Priority: " + complaint.getPriority() + ").",
                "/issues.html",
                false, complaint.getPriority() != null ? complaint.getPriority() : "HIGH",
                null, null
        );
        notificationDAO.createNotification(staffNotif);

        // 2. Notify Student Complaint Owner
        if (complaint.getUserId() > 0) {
            Notification studentNotif = new Notification(
                    0, complaint.getUserId(), complaint.getId(), NotificationType.COMPLAINT_ASSIGNED,
                    "Technician Assigned: #" + compNum,
                    "A maintenance technician has been assigned to inspect and resolve your complaint #" + compNum +
                            ". Status is now ASSIGNED.",
                    "/student-dashboard.html#track-complaint",
                    false, "MEDIUM", null, null
            );
            notificationDAO.createNotification(studentNotif);
        }
    }

    /**
     * Trigger 3: When complaint status is updated (e.g. UNDER_REVIEW, IN_PROGRESS, REJECTED).
     */
    public void notifyStatusUpdated(Complaint complaint, String oldStatus, String newStatus, String remarks) {
        if (complaint == null || complaint.getUserId() <= 0) return;

        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();
        String remarksSnippet = (remarks != null && !remarks.trim().isEmpty())
                ? " Remarks: " + remarks.trim()
                : "";

        Notification notif = new Notification(
                0, complaint.getUserId(), complaint.getId(), NotificationType.STATUS_UPDATED,
                "Status Updated: #" + compNum,
                "Your complaint #" + compNum + " status changed to " + newStatus + "." + remarksSnippet,
                "/student-dashboard.html#track-complaint",
                false, "MEDIUM", null, null
        );
        notificationDAO.createNotification(notif);
    }

    /**
     * Trigger 4: When complaint is marked as RESOLVED.
     */
    public void notifyComplaintResolved(Complaint complaint, String remarks) {
        if (complaint == null || complaint.getUserId() <= 0) return;

        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();
        String remarksSnippet = (remarks != null && !remarks.trim().isEmpty())
                ? " Notes: " + remarks.trim()
                : "";

        Notification notif = new Notification(
                0, complaint.getUserId(), complaint.getId(), NotificationType.COMPLAINT_RESOLVED,
                "Issue Resolved: #" + compNum,
                "Your complaint #" + compNum + " has been marked as RESOLVED." + remarksSnippet +
                        " Please confirm resolution or reopen if the defect persists.",
                "/student-dashboard.html#feedback",
                false, "HIGH", null, null
        );
        notificationDAO.createNotification(notif);
    }

    /**
     * Trigger 5: When student reopens a complaint.
     */
    public void notifyComplaintReopened(Complaint complaint, String reason) {
        if (complaint == null) return;

        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();
        String reasonText = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Defect not resolved.";

        String title = "Complaint Reopened: #" + compNum;
        String body = "Complaint #" + compNum + " was REOPENED by resident. Reason: " + reasonText + ". Immediate reinspection required.";

        // Notify assigned staff if any
        if (complaint.getAssignedStaffId() != null && complaint.getAssignedStaffId() > 0) {
            Notification staffNotif = new Notification(
                    0, complaint.getAssignedStaffId(), complaint.getId(), NotificationType.COMPLAINT_REOPENED,
                    title, body, "/issues.html", false, "URGENT", null, null
            );
            notificationDAO.createNotification(staffNotif);
        }

        // Notify Wardens and Admins
        List<Integer> authorityIds = getAuthorityRecipientUserIds(complaint.getHostelId());
        for (int authId : authorityIds) {
            Notification authNotif = new Notification(
                    0, authId, complaint.getId(), NotificationType.COMPLAINT_REOPENED,
                    title, body, "/authority-dashboard.html#history", false, "URGENT", null, null
            );
            notificationDAO.createNotification(authNotif);
        }
    }

    /**
     * Trigger 6: When complaint is escalated.
     */
    public void notifyComplaintEscalated(Complaint complaint, Escalation escalation) {
        if (complaint == null || escalation == null) return;

        String compNum = complaint.getComplaintNumber() != null ? complaint.getComplaintNumber() : "CNX-" + complaint.getId();
        String escNum = escalation.getEscalationNumber() != null ? escalation.getEscalationNumber() : "CNX-ESC-" + escalation.getId();

        // 1. Notify Higher Authority / COE
        List<Integer> coeUserIds = getUserIdsByRole("HIGHER_AUTHORITY");
        for (int coeId : coeUserIds) {
            Notification coeNotif = new Notification(
                    0, coeId, complaint.getId(), NotificationType.COMPLAINT_ESCALATED,
                    "Urgent Escalation " + escNum,
                    "Ticket #" + compNum + " escalated to Higher Authority. Reason: " + escalation.getReason(),
                    "/higher-authority-dashboard.html#escalated",
                    false, "URGENT", null, null
            );
            notificationDAO.createNotification(coeNotif);
        }

        // 2. Notify Admins and Wardens
        List<Integer> adminAndWardenIds = getAuthorityRecipientUserIds(complaint.getHostelId());
        for (int authId : adminAndWardenIds) {
            Notification authNotif = new Notification(
                    0, authId, complaint.getId(), NotificationType.COMPLAINT_ESCALATED,
                    "Complaint Escalated: #" + compNum,
                    "Complaint #" + compNum + " escalated to Higher Authority (" + escNum + ").",
                    "/authority-dashboard.html#escalated",
                    false, "HIGH", null, null
            );
            notificationDAO.createNotification(authNotif);
        }

        // 3. Notify Student Complainant
        if (complaint.getUserId() > 0) {
            Notification studentNotif = new Notification(
                    0, complaint.getUserId(), complaint.getId(), NotificationType.COMPLAINT_ESCALATED,
                    "Escalation Registered: " + escNum,
                    "Your escalation request (" + escNum + ") for ticket #" + compNum + " was successfully forwarded to Higher Authority.",
                    "/student-dashboard.html#escalate",
                    false, "HIGH", null, null
            );
            notificationDAO.createNotification(studentNotif);
        }
    }

    /**
     * Trigger 7 & 8: Digital communication messages & protected responses.
     */
    public void notifyDigitalMessage(int recipientUserId, int complaintId, String compNumber,
                                      String senderRole, String messageSnippet, boolean isProtectedComplaint) {
        if (recipientUserId <= 0) return;

        String notifType;
        String title;
        String body;

        if (isProtectedComplaint) {
            if ("STUDENT".equalsIgnoreCase(senderRole)) {
                // Sent by protected student to authority
                notifType = NotificationType.AUTHORITY_MESSAGE;
                title = "New Message on Protected #" + compNumber;
                body = "Complainant sent an inquiry regarding protected ticket #" + compNumber;
            } else {
                // Sent by authority to protected student
                notifType = NotificationType.PROTECTED_RESPONSE;
                title = "Official Response on Protected #" + compNumber;
                body = senderRole + " responded: \"" + messageSnippet + "\"";
            }
        } else {
            notifType = "ADMIN".equalsIgnoreCase(senderRole) ? NotificationType.ADMIN_MESSAGE : NotificationType.AUTHORITY_MESSAGE;
            title = "New Message on #" + compNumber;
            body = senderRole + " sent: \"" + messageSnippet + "\"";
        }

        Notification notif = new Notification(
                0, recipientUserId, complaintId, notifType,
                title, body, "/student-dashboard.html#messages",
                false, "MEDIUM", null, null
        );
        notificationDAO.createNotification(notif);
    }

    /**
     * Trigger 9: Broadcast system alert.
     */
    public int broadcastSystemAlert(String title, String message, String priority, List<String> targetRoles) {
        return notificationDAO.broadcastSystemAlert(title, message, priority, targetRoles);
    }

    // Helper query methods for recipient resolution
    public List<Notification> getUserNotifications(int userId, boolean unreadOnly, int limit, int offset) {
        if (unreadOnly) {
            return notificationDAO.getUnreadNotificationsByUserId(userId);
        }
        return notificationDAO.getNotificationsByUser(userId, limit, offset);
    }

    public int getUnreadCount(int userId) {
        return notificationDAO.getUnreadCount(userId);
    }

    public boolean markAsRead(int notificationId, int userId) {
        return notificationDAO.markAsRead(notificationId, userId);
    }

    public boolean markAllAsRead(int userId) {
        return notificationDAO.markAllAsRead(userId);
    }

    public boolean deleteNotification(int notificationId, int userId) {
        return notificationDAO.deleteNotification(notificationId, userId);
    }

    private List<Integer> getAuthorityRecipientUserIds(Integer hostelId) {
        List<Integer> list = new ArrayList<>();
        String sql = "SELECT id FROM users WHERE role IN ('ADMIN', 'WARDEN') AND is_active = TRUE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(rs.getInt("id"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error finding authority recipients", e);
        }
        return list;
    }

    private List<Integer> getUserIdsByRole(String role) {
        List<Integer> list = new ArrayList<>();
        String sql = "SELECT id FROM users WHERE role = ? AND is_active = TRUE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, role);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(rs.getInt("id"));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error finding users for role: " + role, e);
        }
        return list;
    }
}
