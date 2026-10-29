package com.campusnexa.servlet;

import com.campusnexa.dao.AssignmentDAO;
import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationDAO;
import com.campusnexa.dao.MaintenanceStaffDAO;
import com.campusnexa.dao.MessageDAO;
import com.campusnexa.model.Assignment;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.ComplaintStatusHistory;
import com.campusnexa.model.Escalation;
import com.campusnexa.model.MaintenanceStaff;
import com.campusnexa.model.Message;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Enterprise Servlet for Warden and Deputy Warden Operations.
 * Enforces server-side identity protection, strict RBAC, and real-time MySQL mutations.
 */
@WebServlet(name = "AuthorityServlet", urlPatterns = {
        "/api/authority",
        "/api/authority/*"
})
public class AuthorityServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(AuthorityServlet.class.getName());

    private final ComplaintDAO complaintDAO;
    private final AssignmentDAO assignmentDAO;
    private final MaintenanceStaffDAO staffDAO;
    private final MessageDAO messageDAO;
    private final EscalationDAO escalationDAO;

    public AuthorityServlet() {
        this(new ComplaintDAO(), new AssignmentDAO(), new MaintenanceStaffDAO(), new MessageDAO(), new EscalationDAO());
    }

    public AuthorityServlet(ComplaintDAO complaintDAO, AssignmentDAO assignmentDAO,
                            MaintenanceStaffDAO staffDAO, MessageDAO messageDAO, EscalationDAO escalationDAO) {
        this.complaintDAO = complaintDAO;
        this.assignmentDAO = assignmentDAO;
        this.staffDAO = staffDAO;
        this.messageDAO = messageDAO;
        this.escalationDAO = escalationDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required.\"}");
            return;
        }

        String role = (String) session.getAttribute("role");
        if (role == null || (!role.equalsIgnoreCase("WARDEN") && !role.equalsIgnoreCase("DEPUTY_WARDEN") && !role.equalsIgnoreCase("ADMIN"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access restricted to Warden and Authority personnel.\"}");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        int userId = (Integer) session.getAttribute("userId");

        switch (pathInfo) {
            case "/stats":
                handleStats(response, out);
                break;
            case "/complaints":
                handleComplaints(request, response, out);
                break;
            case "/staff":
                handleStaff(response, out);
                break;
            case "/messages":
                handleGetMessages(request, response, out, userId, role);
                break;
            case "/reports":
                handleReports(response, out);
                break;
            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Endpoint not found.\"}");
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required.\"}");
            return;
        }

        String role = (String) session.getAttribute("role");
        if (role == null || (!role.equalsIgnoreCase("WARDEN") && !role.equalsIgnoreCase("DEPUTY_WARDEN") && !role.equalsIgnoreCase("ADMIN"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access restricted to Warden and Authority personnel.\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/assign":
                handleAssignStaff(request, response, out, userId);
                break;
            case "/priority":
                handleUpdatePriority(request, response, out, userId);
                break;
            case "/status":
                handleUpdateStatus(request, response, out, userId);
                break;
            case "/escalate":
                handleEscalateComplaint(request, response, out, userId);
                break;
            case "/message":
                handleSendMessage(request, response, out, userId, role);
                break;
            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Endpoint not found.\"}");
                break;
        }
    }

    private void handleStats(HttpServletResponse response, PrintWriter out) {
        Map<String, Integer> stats = complaintDAO.getWardenStats();
        out.write(String.format(
                "{\"success\":true,\"stats\":{\"newComplaints\":%d,\"pendingReview\":%d,\"assigned\":%d,\"inProgress\":%d,\"overdue\":%d,\"escalated\":%d,\"resolved\":%d}}",
                stats.get("newComplaints"),
                stats.get("pendingReview"),
                stats.get("assigned"),
                stats.get("inProgress"),
                stats.get("overdue"),
                stats.get("escalated"),
                stats.get("resolved")
        ));
    }

    private void handleComplaints(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        String filter = request.getParameter("filter");
        String search = request.getParameter("search");
        List<Complaint> list = complaintDAO.getWardenComplaints(filter, search);

        StringBuilder sb = new StringBuilder("{\"success\":true,\"complaints\":[");
        for (int i = 0; i < list.size(); i++) {
            Complaint c = list.get(i);
            sb.append(toJsonWardenComplaint(c));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]}");
        out.write(sb.toString());
    }

    /**
     * Strict Server-Side Identity Masking for Protected Complaints.
     * Guaranteed: student name, registration number, phone, and email are never sent over the wire.
     */
    private String toJsonWardenComplaint(Complaint c) {
        boolean isProtected = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
        String studentUsername = isProtected ? "PROTECTED_COMPLAINANT" : c.getStudentUsername();
        String studentFullName = isProtected ? "Identity: 🔒 PROTECTED" : c.getStudentFullName();
        String vis = c.getVisibility() != null ? c.getVisibility() : (isProtected ? "PROTECTED" : "STANDARD");

        return "{" +
                "\"id\":" + c.getId() + "," +
                "\"complaintNumber\":\"" + ValidationUtil.escapeJson(c.getComplaintNumber()) + "\"," +
                "\"userId\":" + (isProtected ? 0 : c.getUserId()) + "," +
                "\"studentUsername\":\"" + ValidationUtil.escapeJson(studentUsername) + "\"," +
                "\"studentFullName\":\"" + ValidationUtil.escapeJson(studentFullName) + "\"," +
                "\"categoryId\":" + c.getCategoryId() + "," +
                "\"categoryCode\":\"" + ValidationUtil.escapeJson(c.getCategoryCode()) + "\"," +
                "\"categoryName\":\"" + ValidationUtil.escapeJson(c.getCategoryName()) + "\"," +
                "\"categoryIcon\":\"" + ValidationUtil.escapeJson(c.getCategoryIcon()) + "\"," +
                "\"subCategory\":\"" + ValidationUtil.escapeJson(c.getSubCategory()) + "\"," +
                "\"hostelId\":" + (c.getHostelId() != null ? c.getHostelId() : "null") + "," +
                "\"hostelName\":\"" + ValidationUtil.escapeJson(c.getHostelName()) + "\"," +
                "\"facilityId\":" + (c.getFacilityId() != null ? c.getFacilityId() : "null") + "," +
                "\"facilityName\":\"" + ValidationUtil.escapeJson(c.getFacilityName()) + "\"," +
                "\"building\":\"" + ValidationUtil.escapeJson(c.getBuilding()) + "\"," +
                "\"roomNumber\":\"" + ValidationUtil.escapeJson(c.getRoomNumber()) + "\"," +
                "\"location\":\"" + ValidationUtil.escapeJson(c.getLocation()) + "\"," +
                "\"title\":\"" + ValidationUtil.escapeJson(c.getTitle()) + "\"," +
                "\"description\":\"" + ValidationUtil.escapeJson(c.getDescription()) + "\"," +
                "\"priority\":\"" + ValidationUtil.escapeJson(c.getPriority()) + "\"," +
                "\"status\":\"" + ValidationUtil.escapeJson(c.getStatus()) + "\"," +
                "\"isProtected\":" + isProtected + "," +
                "\"visibility\":\"" + ValidationUtil.escapeJson(vis) + "\"," +
                "\"protectionReason\":\"" + (isProtected ? ValidationUtil.escapeJson(c.getProtectionReason()) : "") + "\"," +
                "\"assignedStaffId\":" + (c.getAssignedStaffId() != null ? c.getAssignedStaffId() : "null") + "," +
                "\"assignedStaffName\":\"" + ValidationUtil.escapeJson(c.getAssignedStaffName()) + "\"," +
                "\"assignedAt\":\"" + (c.getAssignedAt() != null ? c.getAssignedAt().toString() : "") + "\"," +
                "\"slaDeadline\":\"" + (c.getSlaDeadline() != null ? c.getSlaDeadline().toString() : "") + "\"," +
                "\"isOverdue\":" + c.isOverdue() + "," +
                "\"workStartedAt\":\"" + (c.getWorkStartedAt() != null ? c.getWorkStartedAt().toString() : "") + "\"," +
                "\"resolvedAt\":\"" + (c.getResolvedAt() != null ? c.getResolvedAt().toString() : "") + "\"," +
                "\"responseTimeSeconds\":" + (c.getResponseTimeSeconds() != null ? c.getResponseTimeSeconds() : "null") + "," +
                "\"resolutionTimeSeconds\":" + (c.getResolutionTimeSeconds() != null ? c.getResolutionTimeSeconds() : "null") + "," +
                "\"responseTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResponseTimeFormatted() != null ? c.getResponseTimeFormatted() : "N/A") + "\"," +
                "\"resolutionTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResolutionTimeFormatted() != null ? c.getResolutionTimeFormatted() : "N/A") + "\"," +
                "\"isResponseOverdue\":" + c.isResponseOverdue() + "," +
                "\"isResolutionOverdue\":" + c.isResolutionOverdue() + "," +
                "\"expectedResponseHours\":" + (c.getExpectedResponseHours() != null ? c.getExpectedResponseHours() : 6) + "," +
                "\"expectedResolutionHours\":" + (c.getExpectedResolutionHours() != null ? c.getExpectedResolutionHours() : 24) + "," +
                "\"overdueReason\":\"" + ValidationUtil.escapeJson(c.getOverdueReason() != null ? c.getOverdueReason() : "") + "\"," +
                "\"createdAt\":\"" + (c.getCreatedAt() != null ? c.getCreatedAt().toString() : "") + "\"," +
                "\"updatedAt\":\"" + (c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : "") + "\"" +
                "}";
    }

    private void handleStaff(HttpServletResponse response, PrintWriter out) {
        List<MaintenanceStaff> staffList = staffDAO.getAllStaff();
        StringBuilder sb = new StringBuilder("{\"success\":true,\"staff\":[");
        for (int i = 0; i < staffList.size(); i++) {
            MaintenanceStaff s = staffList.get(i);
            sb.append("{")
                    .append("\"id\":").append(s.getId()).append(",")
                    .append("\"userId\":").append(s.getUserId()).append(",")
                    .append("\"fullName\":\"").append(ValidationUtil.escapeJson(s.getFullName())).append("\",")
                    .append("\"specialty\":\"").append(ValidationUtil.escapeJson(s.getSpecialty())).append("\",")
                    .append("\"activeTasks\":").append(s.getActiveTasks()).append(",")
                    .append("\"isAvailable\":").append(s.isAvailable())
                    .append("}");
            if (i < staffList.size() - 1) sb.append(",");
        }
        sb.append("]}");
        out.write(sb.toString());
    }

    private void handleAssignStaff(HttpServletRequest request, HttpServletResponse response,
                                   PrintWriter out, int wardenUserId) {
        String complaintIdStr = request.getParameter("complaintId");
        String staffUserIdStr = request.getParameter("staffId");
        String instructions = request.getParameter("instructions");

        if (!ValidationUtil.isNotEmpty(complaintIdStr) || !ValidationUtil.isNotEmpty(staffUserIdStr)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and staffId are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            int staffUserId = Integer.parseInt(staffUserIdStr.trim());

            Complaint comp = complaintDAO.getComplaintById(complaintId);
            if (comp == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
                return;
            }

            Assignment assignment = new Assignment();
            assignment.setComplaintId(complaintId);
            assignment.setStaffId(staffUserId);
            assignment.setAssignedBy(wardenUserId);
            assignment.setInstructions(ValidationUtil.isNotEmpty(instructions) ? instructions : "Assigned by Warden for prompt inspection and repair.");

            boolean ok = assignmentDAO.createAssignment(assignment);
            if (ok) {
                try {
                    new com.campusnexa.service.NotificationService().notifyComplaintAssigned(comp, staffUserId, assignment.getInstructions());
                } catch (Exception ignored) {}
                out.write("{\"success\":true,\"message\":\"Maintenance staff successfully assigned.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to assign staff in database.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId or staffId.\"}");
        }
    }

    private void handleUpdatePriority(HttpServletRequest request, HttpServletResponse response,
                                      PrintWriter out, int wardenUserId) {
        String complaintIdStr = request.getParameter("complaintId");
        String priority = request.getParameter("priority");
        String remarks = request.getParameter("remarks");

        if (!ValidationUtil.isNotEmpty(complaintIdStr) || !ValidationUtil.isNotEmpty(priority)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and priority are required.\"}");
            return;
        }

        priority = priority.trim().toUpperCase();
        if (!List.of("LOW", "MEDIUM", "HIGH", "CRITICAL").contains(priority)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid priority level: " + ValidationUtil.escapeJson(priority) + "\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            boolean ok = complaintDAO.updatePriority(complaintId, priority, remarks, wardenUserId);
            if (ok) {
                out.write("{\"success\":true,\"message\":\"Priority successfully updated to " + priority + ".\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to update priority in database.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleUpdateStatus(HttpServletRequest request, HttpServletResponse response,
                                    PrintWriter out, int wardenUserId) {
        String complaintIdStr = request.getParameter("complaintId");
        String status = request.getParameter("status");
        String remarks = request.getParameter("remarks");

        if (!ValidationUtil.isNotEmpty(complaintIdStr) || !ValidationUtil.isNotEmpty(status)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and status are required.\"}");
            return;
        }

        status = status.trim().toUpperCase();
        List<String> allowedStatuses = List.of(
                "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED", "REJECTED"
        );
        if (!allowedStatuses.contains(status)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Warden cannot transition ticket to status: " + ValidationUtil.escapeJson(status) + "\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            Complaint compBefore = complaintDAO.getComplaintById(complaintId);
            String oldStatus = compBefore != null ? compBefore.getStatus() : "SUBMITTED";

            boolean ok = complaintDAO.updateStatus(complaintId, status, remarks, wardenUserId);
            if (ok) {
                try {
                    Complaint compAfter = complaintDAO.getComplaintById(complaintId);
                    if (compAfter != null) {
                        if ("RESOLVED".equalsIgnoreCase(status)) {
                            new com.campusnexa.service.NotificationService().notifyComplaintResolved(compAfter, remarks);
                        } else {
                            new com.campusnexa.service.NotificationService().notifyStatusUpdated(compAfter, oldStatus, status, remarks);
                        }
                    }
                } catch (Exception ignored) {}
                out.write("{\"success\":true,\"message\":\"Status successfully updated to " + status + ".\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to update status in database.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleEscalateComplaint(HttpServletRequest request, HttpServletResponse response,
                                         PrintWriter out, int wardenUserId) {
        String complaintIdStr = request.getParameter("complaintId");
        String reason = request.getParameter("reason");
        String escalationType = request.getParameter("escalationType");

        if (!ValidationUtil.isNotEmpty(complaintIdStr) || !ValidationUtil.isNotEmpty(reason)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and reason are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            Escalation esc = new Escalation();
            esc.setComplaintId(complaintId);
            esc.setEscalatedBy(wardenUserId);
            esc.setReason(reason.trim());
            esc.setEscalationType(ValidationUtil.isNotEmpty(escalationType) ? escalationType.trim().toUpperCase() : "AUTHORITY_INTERVENTION");

            boolean ok = escalationDAO.createEscalation(esc);
            if (ok) {
                out.write(String.format(
                        "{\"success\":true,\"escalationNumber\":\"%s\",\"message\":\"Ticket successfully escalated to Higher Authority.\"}",
                        ValidationUtil.escapeJson(esc.getEscalationNumber())
                ));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to create escalation record in database.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleGetMessages(HttpServletRequest request, HttpServletResponse response,
                                   PrintWriter out, int userId, String role) {
        String complaintIdStr = request.getParameter("complaintId");
        if (!ValidationUtil.isNotEmpty(complaintIdStr)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId is required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            Complaint comp = complaintDAO.getComplaintById(complaintId);
            boolean isProtected = (comp != null && (comp.isProtected() || "PROTECTED".equalsIgnoreCase(comp.getVisibility())));

            // Automatically mark student messages as read by authority upon viewing thread
            messageDAO.markMessagesAsRead(complaintId, userId, role);

            List<Message> messages = messageDAO.getMessagesByComplaintId(complaintId);
            StringBuilder sb = new StringBuilder("{\"success\":true,\"messages\":[");
            for (int i = 0; i < messages.size(); i++) {
                Message m = messages.get(i);
                String senderDisplay = m.getSenderName();
                int senderId = m.getSenderId();
                if (isProtected && "STUDENT".equalsIgnoreCase(m.getSenderRole())) {
                    senderDisplay = "Identity: PROTECTED";
                    senderId = 0; // Strict identity masking
                }
                sb.append("{")
                        .append("\"id\":").append(m.getId()).append(",")
                        .append("\"senderId\":").append(senderId).append(",")
                        .append("\"senderName\":\"").append(ValidationUtil.escapeJson(senderDisplay)).append("\",")
                        .append("\"senderRole\":\"").append(ValidationUtil.escapeJson(m.getSenderRole())).append("\",")
                        .append("\"receiverRole\":\"").append(ValidationUtil.escapeJson(m.getReceiverRole() != null ? m.getReceiverRole() : "STUDENT")).append("\",")
                        .append("\"messageText\":\"").append(ValidationUtil.escapeJson(m.getMessage())).append("\",")
                        .append("\"isRead\":").append(m.isRead()).append(",")
                        .append("\"createdAt\":\"").append(m.getCreatedAt() != null ? m.getCreatedAt().toString() : "").append("\"")
                        .append("}");
                if (i < messages.size() - 1) sb.append(",");
            }
            sb.append("]}");
            out.write(sb.toString());
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleSendMessage(HttpServletRequest request, HttpServletResponse response,
                                   PrintWriter out, int wardenUserId, String wardenRole) {
        String complaintIdStr = request.getParameter("complaintId");
        String messageText = request.getParameter("message");
        String recipientIdStr = request.getParameter("recipientId");

        if (!ValidationUtil.isNotEmpty(complaintIdStr) || !ValidationUtil.isNotEmpty(messageText)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and message are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdStr.trim());
            Complaint comp = complaintDAO.getComplaintById(complaintId);
            if (comp == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
                return;
            }

            Integer recipientId = null;
            if (ValidationUtil.isNotEmpty(recipientIdStr)) {
                try { recipientId = Integer.parseInt(recipientIdStr.trim()); } catch (NumberFormatException ignored) {}
            }
            if (recipientId == null || recipientId == 0) {
                recipientId = comp.getUserId();
            }

            Message msg = new Message();
            msg.setComplaintId(complaintId);
            msg.setSenderId(wardenUserId);
            msg.setRecipientId(recipientId);
            msg.setSenderRole(wardenRole);
            msg.setReceiverRole("STUDENT");
            msg.setMessageText(messageText.trim());
            msg.setMessage(messageText.trim());
            msg.setProtectedSender(false); // Warden is official authority

            boolean ok = messageDAO.sendMessage(msg);
            if (ok) {
                out.write("{\"success\":true,\"message\":\"Message sent successfully.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to send message.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleReports(HttpServletResponse response, PrintWriter out) {
        Map<String, Integer> stats = complaintDAO.getWardenStats();
        out.write(String.format(
                "{\"success\":true,\"summary\":{\"totalProcessed\":%d,\"resolvedCount\":%d,\"overdueCount\":%d,\"escalatedCount\":%d}}",
                stats.get("newComplaints") + stats.get("pendingReview") + stats.get("assigned") + stats.get("inProgress") + stats.get("resolved"),
                stats.get("resolved"),
                stats.get("overdue"),
                stats.get("escalated")
        ));
    }
}
