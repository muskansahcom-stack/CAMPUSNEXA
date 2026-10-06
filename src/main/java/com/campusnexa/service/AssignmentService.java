package com.campusnexa.service;

import com.campusnexa.dao.AssignmentDAO;
import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.model.Assignment;
import com.campusnexa.model.Complaint;

import java.util.logging.Logger;

/**
 * Service Layer coordinating Maintenance Technician Assignments and Phase 19 notifications.
 */
public class AssignmentService {

    private static final Logger LOGGER = Logger.getLogger(AssignmentService.class.getName());
    private final AssignmentDAO assignmentDAO;
    private final ComplaintDAO complaintDAO;
    private final NotificationService notificationService;

    public AssignmentService() {
        this(new AssignmentDAO(), new ComplaintDAO(), new NotificationService());
    }

    public AssignmentService(AssignmentDAO assignmentDAO, ComplaintDAO complaintDAO, NotificationService notificationService) {
        this.assignmentDAO = assignmentDAO;
        this.complaintDAO = complaintDAO;
        this.notificationService = notificationService;
    }

    /**
     * Dispatches technician assignment and notifies technician and complainant.
     */
    public boolean assignTechnician(Assignment assignment) {
        if (assignment == null) return false;

        boolean ok = assignmentDAO.createAssignment(assignment);
        if (ok) {
            Complaint complaint = complaintDAO.getComplaintById(assignment.getComplaintId());
            if (complaint != null) {
                notificationService.notifyComplaintAssigned(
                        complaint,
                        assignment.getStaffId(),
                        assignment.getInstructions()
                );
            }
        }
        return ok;
    }

    public AssignmentDAO getAssignmentDAO() {
        return assignmentDAO;
    }
}
