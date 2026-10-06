package com.campusnexa.service;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.UserDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.User;

import java.util.logging.Logger;

/**
 * Service Layer coordinating Complaint business workflows and automated notifications.
 */
public class ComplaintService {

    private static final Logger LOGGER = Logger.getLogger(ComplaintService.class.getName());
    private final ComplaintDAO complaintDAO;
    private final NotificationService notificationService;
    private final UserDAO userDAO;

    public ComplaintService() {
        this(new ComplaintDAO(), new NotificationService(), new UserDAO());
    }

    public ComplaintService(ComplaintDAO complaintDAO, NotificationService notificationService, UserDAO userDAO) {
        this.complaintDAO = complaintDAO;
        this.notificationService = notificationService;
        this.userDAO = userDAO;
    }

    /**
     * Submits a complaint and automatically fires Phase 19 database-backed notifications.
     */
    public boolean submitComplaint(Complaint complaint, String clientIp, int studentUserId) {
        boolean ok = complaintDAO.createComplaint(complaint, clientIp);
        if (ok) {
            User student = userDAO.findById(studentUserId);
            notificationService.notifyComplaintSubmitted(complaint, student);
        }
        return ok;
    }

    /**
     * Updates complaint status and fires student status-change or resolution notification.
     */
    public boolean updateStatus(int complaintId, String newStatus, String remarks, int changedByUserId) {
        Complaint beforeUpdate = complaintDAO.getComplaintById(complaintId);
        String oldStatus = beforeUpdate != null ? beforeUpdate.getStatus() : "UNKNOWN";

        boolean ok = complaintDAO.updateStatus(complaintId, newStatus, remarks, changedByUserId);
        if (ok) {
            Complaint afterUpdate = complaintDAO.getComplaintById(complaintId);
            if (afterUpdate != null) {
                if ("RESOLVED".equalsIgnoreCase(newStatus)) {
                    notificationService.notifyComplaintResolved(afterUpdate, remarks);
                } else {
                    notificationService.notifyStatusUpdated(afterUpdate, oldStatus, newStatus, remarks);
                }
            }
        }
        return ok;
    }

    public ComplaintDAO getComplaintDAO() {
        return complaintDAO;
    }

    public NotificationService getNotificationService() {
        return notificationService;
    }
}
