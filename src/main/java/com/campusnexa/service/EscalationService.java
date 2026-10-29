package com.campusnexa.service;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.Escalation;

import java.util.logging.Logger;

/**
 * Service Layer coordinating Formal Escalations and Phase 19 notifications.
 */
public class EscalationService {

    private static final Logger LOGGER = Logger.getLogger(EscalationService.class.getName());
    private final EscalationDAO escalationDAO;
    private final ComplaintDAO complaintDAO;
    private final NotificationService notificationService;

    public EscalationService() {
        this(new EscalationDAO(), new ComplaintDAO(), new NotificationService());
    }

    public EscalationService(EscalationDAO escalationDAO, ComplaintDAO complaintDAO, NotificationService notificationService) {
        this.escalationDAO = escalationDAO;
        this.complaintDAO = complaintDAO;
        this.notificationService = notificationService;
    }

    /**
     * Creates an escalation and notifies Higher Authority, Admins, Wardens, and Student.
     */
    public boolean createEscalation(Escalation escalation, int raisedByUserId) {
        if (escalation == null) return false;
        if (raisedByUserId > 0) {
            escalation.setEscalatedBy(raisedByUserId);
        }

        boolean ok = escalationDAO.createEscalation(escalation);
        if (ok) {
            Complaint complaint = complaintDAO.getComplaintById(escalation.getComplaintId());
            if (complaint != null) {
                notificationService.notifyComplaintEscalated(complaint, escalation);
            }
        }
        return ok;
    }

    public EscalationDAO getEscalationDAO() {
        return escalationDAO;
    }
}
