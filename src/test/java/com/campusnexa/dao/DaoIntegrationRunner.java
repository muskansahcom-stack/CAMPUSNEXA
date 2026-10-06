package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.*;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

/**
 * Direct Integration Test Runner for Phase 3 JDBC and DAO Layer against MySQL.
 * Verifies bidirectional mapping:
 *   Java -> DAO -> JDBC -> MySQL
 *   MySQL -> JDBC -> DAO -> Java
 */
public class DaoIntegrationRunner {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("  CAMPUSNEXA PHASE 3: COMPREHENSIVE JDBC & DAO LAYER INTEGRATION TEST");
        System.out.println("================================================================================");

        int passed = 0;
        int failed = 0;

        // 1. Test DBConnection
        try {
            System.out.print("[TEST 01] DBConnection (JDBC DriverManager Connection) ... ");
            try (Connection conn = DBConnection.getConnection()) {
                if (conn != null && !conn.isClosed()) {
                    System.out.println("PASSED (Active MySQL Catalog: " + conn.getCatalog() + ")");
                    passed++;
                } else {
                    System.out.println("FAILED (Connection is null or closed)");
                    failed++;
                }
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 2. Test UserDAO
        try {
            System.out.print("[TEST 02] UserDAO (Read/Authenticate across 5 roles) ... ");
            UserDAO userDAO = new UserDAO();
            User admin = userDAO.findByUsernameAndPassword("admin", "admin123");
            User student = userDAO.findByUsername("student1");
            List<User> students = userDAO.findUsersByRole("STUDENT");

            if (admin != null && "ADMIN".equals(admin.getRole()) &&
                student != null && "STUDENT".equals(student.getRole()) &&
                !students.isEmpty()) {
                System.out.println("PASSED (Found Admin ID=" + admin.getId() + ", Student Count=" + students.size() + ")");
                passed++;
            } else {
                System.out.println("FAILED (Could not retrieve expected users)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 3. Test CategoryDAO
        try {
            System.out.print("[TEST 03] CategoryDAO (Read, Search, and Category mapping) ... ");
            CategoryDAO categoryDAO = new CategoryDAO();
            List<Category> allCategories = categoryDAO.getAllCategories();
            Category electrical = categoryDAO.getCategoryByCode("ELECTRICAL");
            List<Category> search = categoryDAO.searchCategories("room");

            if (allCategories.size() >= 11 && electrical != null && electrical.getDefaultSlaHours() == 12 && !search.isEmpty()) {
                System.out.println("PASSED (Categories: " + allCategories.size() + ", Electrical SLA: " + electrical.getDefaultSlaHours() + "h)");
                passed++;
            } else {
                System.out.println("FAILED (Category count=" + allCategories.size() + ")");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 4. Test FacilityDAO
        try {
            System.out.print("[TEST 04] FacilityDAO (Read, Search campus facilities) ... ");
            FacilityDAO facilityDAO = new FacilityDAO();
            List<Facility> facilities = facilityDAO.getAllFacilities();
            Facility library = facilityDAO.getFacilityById(1);

            if (!facilities.isEmpty() && library != null) {
                System.out.println("PASSED (Found " + facilities.size() + " facilities, ID 1: " + library.getName() + ")");
                passed++;
            } else {
                System.out.println("FAILED (No facilities returned)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 5. Test HostelDAO
        try {
            System.out.print("[TEST 05] HostelDAO (Read, Search residential hostels) ... ");
            HostelDAO hostelDAO = new HostelDAO();
            List<Hostel> hostels = hostelDAO.getAllHostels();
            Hostel bh1 = hostelDAO.getHostelById(1);

            if (!hostels.isEmpty() && bh1 != null) {
                System.out.println("PASSED (Found " + hostels.size() + " hostels, ID 1: " + bh1.getName() + " - " + bh1.getType() + ")");
                passed++;
            } else {
                System.out.println("FAILED (No hostels returned)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 6. Test MaintenanceStaffDAO
        try {
            System.out.print("[TEST 06] MaintenanceStaffDAO (Technician profiles and workloads) ... ");
            MaintenanceStaffDAO staffDAO = new MaintenanceStaffDAO();
            List<MaintenanceStaff> staffList = staffDAO.getAllStaff();
            MaintenanceStaff leadElectrician = staffDAO.getStaffByUserId(2);

            if (!staffList.isEmpty() && leadElectrician != null) {
                System.out.println("PASSED (Staff: " + staffList.size() + ", Tech: " + leadElectrician.getFullName() + ", Specialty: " + leadElectrician.getSpecialty() + ")");
                passed++;
            } else {
                System.out.println("FAILED (No staff returned)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 7. Test ComplaintDAO
        try {
            System.out.print("[TEST 07] ComplaintDAO (Full Lifecycle, Stats, PreparedStatement) ... ");
            ComplaintDAO complaintDAO = new ComplaintDAO();
            List<Complaint> studentComplaints = complaintDAO.getComplaintsByUserId(3);
            Map<String, Integer> stats = complaintDAO.getStudentStats(3);
            Complaint c1 = complaintDAO.getComplaintByNumber("CNX-2026-000001");
            List<ComplaintStatusHistory> timeline = c1 != null ? complaintDAO.getTimeline(c1.getId()) : List.of();

            if (!studentComplaints.isEmpty() && stats.get("total") > 0 && c1 != null && !timeline.isEmpty()) {
                System.out.println("PASSED (Student Tickets: " + studentComplaints.size() + ", Stats Total: " + stats.get("total") + ", Timeline Entries: " + timeline.size() + ")");
                passed++;
            } else {
                System.out.println("FAILED (Complaints verification failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 8. Test AssignmentDAO
        try {
            System.out.print("[TEST 08] AssignmentDAO (Work assignments and staff tasks) ... ");
            AssignmentDAO assignmentDAO = new AssignmentDAO();
            Assignment testAssign = new Assignment();
            testAssign.setComplaintId(1);
            testAssign.setStaffId(2);
            testAssign.setAssignedBy(1);
            testAssign.setInstructions("Test diagnostic inspection");

            boolean assigned = assignmentDAO.createAssignment(testAssign);
            List<Assignment> forComplaint = assignmentDAO.getAssignmentsByComplaintId(1);
            List<Assignment> forStaff = assignmentDAO.getAssignmentsByStaffId(2);

            if (assigned && !forComplaint.isEmpty() && !forStaff.isEmpty()) {
                System.out.println("PASSED (Assignment ID=" + testAssign.getId() + ", Status=" + testAssign.getStatus() + ")");
                passed++;
            } else {
                System.out.println("FAILED (Could not create or fetch assignment)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 9. Test EscalationDAO
        try {
            System.out.print("[TEST 09] EscalationDAO (Grievance Escalation to Higher Authority) ... ");
            EscalationDAO escalationDAO = new EscalationDAO();
            Escalation testEsc = new Escalation();
            testEsc.setComplaintId(2);
            testEsc.setEscalatedBy(3);
            testEsc.setEscalationType("SLA_BREACH");
            testEsc.setReason("Urgent electrical hazard pending over target SLA window");

            boolean escalated = escalationDAO.createEscalation(testEsc);
            List<Escalation> allEscalations = escalationDAO.getAllEscalations(null);
            int pending = escalationDAO.getPendingEscalationsCount();

            if (escalated && !allEscalations.isEmpty() && pending > 0) {
                System.out.println("PASSED (Escalation #: " + testEsc.getEscalationNumber() + ", Pending: " + pending + ")");
                passed++;
            } else {
                System.out.println("FAILED (Escalation creation failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 10. Test MessageDAO
        try {
            System.out.print("[TEST 10] MessageDAO (Digital 2-way communication) ... ");
            MessageDAO messageDAO = new MessageDAO();
            Message msg = new Message();
            msg.setComplaintId(1);
            msg.setSenderId(5); // Warden
            msg.setRecipientId(3); // Student
            msg.setSenderRole("WARDEN");
            msg.setMessageText("Electrician has been dispatched to check your AC water leakage.");
            msg.setProtectedSender(false);

            boolean sent = messageDAO.sendMessage(msg);
            List<Message> thread = messageDAO.getMessagesByComplaintId(1);
            int unread = messageDAO.getUnreadCount(3);

            if (sent && !thread.isEmpty()) {
                System.out.println("PASSED (Message ID=" + msg.getId() + ", Thread Size=" + thread.size() + ", Unread=" + unread + ")");
                passed++;
            } else {
                System.out.println("FAILED (Message send/read failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 11. Test FeedbackDAO
        try {
            System.out.print("[TEST 11] FeedbackDAO (Ratings and Reopen workflow) ... ");
            FeedbackDAO feedbackDAO = new FeedbackDAO();
            Feedback fb = new Feedback();
            fb.setComplaintId(1);
            fb.setStudentId(3);
            fb.setRating(5);
            fb.setComments("Prompt repair! AC is functioning perfectly now without leakage.");
            fb.setReopened(false);

            boolean submitted = feedbackDAO.submitFeedback(fb);
            Feedback fetched = feedbackDAO.getFeedbackByComplaintId(1);
            double avgRating = feedbackDAO.getAverageRating();

            if (submitted && fetched != null) {
                System.out.println("PASSED (Feedback ID=" + fb.getId() + ", Rating=" + fetched.getRating() + " stars, Avg=" + String.format("%.1f", avgRating) + ")");
                passed++;
            } else {
                System.out.println("FAILED (Feedback submission failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 12. Test NotificationDAO
        try {
            System.out.print("[TEST 12] NotificationDAO (User notifications and alerts) ... ");
            NotificationDAO notifDAO = new NotificationDAO();
            Notification n = new Notification();
            n.setUserId(3);
            n.setTitle("Technician Assigned");
            n.setMessage("Your ticket #CNX-2026-000001 has been assigned to Rajesh Sharma.");
            n.setLinkUrl("student-dashboard.html#track-complaint");

            boolean created = notifDAO.createNotification(n);
            List<Notification> unread = notifDAO.getUnreadNotificationsByUserId(3);
            boolean marked = notifDAO.markAsRead(n.getId());

            if (created && !unread.isEmpty() && marked) {
                System.out.println("PASSED (Notification ID=" + n.getId() + ", Read State Updated)");
                passed++;
            } else {
                System.out.println("FAILED (Notification failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // 13. Test AuditLogDAO
        try {
            System.out.print("[TEST 13] AuditLogDAO (Operational and Security Audit Trail) ... ");
            AuditLogDAO auditDAO = new AuditLogDAO();
            boolean logged = auditDAO.logAction(1, "ADMIN_ACCESS", "Accessed system security parameters", "127.0.0.1");
            List<AuditLog> recent = auditDAO.getRecentLogs(5);
            List<AuditLog> userLogs = auditDAO.getLogsByUser(1, 5);

            if (logged && !recent.isEmpty() && !userLogs.isEmpty()) {
                System.out.println("PASSED (Recent Logs: " + recent.size() + ", Latest Action: " + recent.get(0).getAction() + ")");
                passed++;
            } else {
                System.out.println("FAILED (AuditLog failed)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        System.out.println("================================================================================");
        System.out.println("  PHASE 3 TEST SUMMARY: " + passed + " PASSED, " + failed + " FAILED");
        System.out.println("================================================================================");

        if (failed > 0) {
            System.exit(1);
        }
    }
}
