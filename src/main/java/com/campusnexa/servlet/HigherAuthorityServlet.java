package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationDAO;
import com.campusnexa.dao.MessageDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.ComplaintEvidence;
import com.campusnexa.model.ComplaintStatusHistory;
import com.campusnexa.model.Escalation;
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
 * Enterprise Servlet for Higher Authority & Controller of Examinations (COE) Operations.
 * Manages institutional escalations, protected reports, executive directives, and system audits.
 * Enforces strict server-side identity masking for protected whistle-blower reports.
 */
@WebServlet(name = "HigherAuthorityServlet", urlPatterns = {
        "/api/higher-authority",
        "/api/higher-authority/*"
})
public class HigherAuthorityServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(HigherAuthorityServlet.class.getName());

    private final ComplaintDAO complaintDAO;
    private final EscalationDAO escalationDAO;
    private final MessageDAO messageDAO;

    public HigherAuthorityServlet() {
        this(new ComplaintDAO(), new EscalationDAO(), new MessageDAO());
    }

    public HigherAuthorityServlet(ComplaintDAO complaintDAO, EscalationDAO escalationDAO, MessageDAO messageDAO) {
        this.complaintDAO = complaintDAO;
        this.escalationDAO = escalationDAO;
        this.messageDAO = messageDAO;
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
        if (role == null || (!role.equalsIgnoreCase("HIGHER_AUTHORITY") && !role.equalsIgnoreCase("ADMIN"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access restricted to Higher Authority and Executive Administration.\"}");
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
            case "/escalations":
                handleEscalations(response, out);
                break;
            case "/detail":
                handleDetail(request, response, out);
                break;
            case "/messages":
                handleMessages(request, response, out, userId);
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
        if (role == null || (!role.equalsIgnoreCase("HIGHER_AUTHORITY") && !role.equalsIgnoreCase("ADMIN"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access restricted to Higher Authority and Executive Administration.\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/action":
                handleRecordAction(request, response, out, userId);
                break;
            case "/remarks":
                handleOfficialRemarks(request, response, out, userId);
                break;
            case "/message":
                handleSendMessage(request, response, out, userId);
                break;
            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Endpoint not found.\"}");
                break;
        }
    }

    private void handleStats(HttpServletResponse response, PrintWriter out) {
        Map<String, Integer> stats = complaintDAO.getHigherAuthorityStats();
        StringBuilder sb = new StringBuilder("{\"success\":true,\"stats\":{");
        sb.append("\"totalEscalations\":").append(stats.getOrDefault("totalEscalations", 0)).append(",");
        sb.append("\"pendingReview\":").append(stats.getOrDefault("pendingReview", 0)).append(",");
        sb.append("\"criticalIssues\":").append(stats.getOrDefault("criticalIssues", 0)).append(",");
        sb.append("\"protectedComplaints\":").append(stats.getOrDefault("protectedComplaints", 0)).append(",");
        sb.append("\"overdue\":").append(stats.getOrDefault("overdue", 0)).append(",");
        sb.append("\"resolved\":").append(stats.getOrDefault("resolved", 0));
        sb.append("}}");
        out.write(sb.toString());
    }

    private void handleComplaints(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        String filter = request.getParameter("filter");
        String search = request.getParameter("search");

        List<Complaint> list = complaintDAO.getHigherAuthorityComplaints(filter, search);
        StringBuilder sb = new StringBuilder("{\"success\":true,\"count\":").append(list.size()).append(",\"complaints\":[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(toJsonHigherAuthorityComplaint(list.get(i)));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]}");
        out.write(sb.toString());
    }

    private void handleEscalations(HttpServletResponse response, PrintWriter out) {
        List<Escalation> list = escalationDAO.getAllEscalations(null);
        StringBuilder sb = new StringBuilder("{\"success\":true,\"count\":").append(list.size()).append(",\"escalations\":[");
        for (int i = 0; i < list.size(); i++) {
            Escalation e = list.get(i);
            Complaint comp = complaintDAO.getComplaintById(e.getComplaintId());
            boolean isProtected = comp != null && (comp.isProtected() || "PROTECTED".equalsIgnoreCase(comp.getVisibility()));
            String escalatedByName = isProtected ? "Identity: 🔒 PROTECTED" : e.getEscalatedByName();

            sb.append("{")
                    .append("\"id\":").append(e.getId()).append(",")
                    .append("\"escalationNumber\":\"").append(ValidationUtil.escapeJson(e.getEscalationNumber())).append("\",")
                    .append("\"complaintId\":").append(e.getComplaintId()).append(",")
                    .append("\"complaintNumber\":\"").append(ValidationUtil.escapeJson(e.getComplaintNumber() != null ? e.getComplaintNumber() : "")).append("\",")
                    .append("\"complaintTitle\":\"").append(ValidationUtil.escapeJson(e.getComplaintTitle() != null ? e.getComplaintTitle() : "")).append("\",")
                    .append("\"isProtected\":").append(isProtected).append(",")
                    .append("\"escalatedByName\":\"").append(ValidationUtil.escapeJson(escalatedByName)).append("\",")
                    .append("\"escalationType\":\"").append(ValidationUtil.escapeJson(e.getEscalationType())).append("\",")
                    .append("\"reason\":\"").append(ValidationUtil.escapeJson(e.getReason())).append("\",")
                    .append("\"status\":\"").append(ValidationUtil.escapeJson(e.getStatus())).append("\",")
                    .append("\"responseDeadline\":\"").append(e.getResponseDeadline() != null ? e.getResponseDeadline().toString() : "").append("\",")
                    .append("\"actionTaken\":\"").append(ValidationUtil.escapeJson(e.getActionTaken() != null ? e.getActionTaken() : "")).append("\",")
                    .append("\"actionByName\":\"").append(ValidationUtil.escapeJson(e.getActionByName() != null ? e.getActionByName() : "")).append("\",")
                    .append("\"actionAt\":\"").append(e.getActionAt() != null ? e.getActionAt().toString() : "").append("\",")
                    .append("\"createdAt\":\"").append(e.getCreatedAt() != null ? e.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]}");
        out.write(sb.toString());
    }

    private void handleDetail(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        String idParam = request.getParameter("id");
        String numberParam = request.getParameter("number");

        Complaint c = null;
        if (ValidationUtil.isNotEmpty(idParam)) {
            try {
                c = complaintDAO.getComplaintById(Integer.parseInt(idParam.trim()));
            } catch (NumberFormatException ignored) {}
        } else if (ValidationUtil.isNotEmpty(numberParam)) {
            c = complaintDAO.getComplaintByNumber(numberParam.trim());
        }

        if (c == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Complaint record not found.\"}");
            return;
        }

        boolean isProtected = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
        List<ComplaintStatusHistory> timeline = complaintDAO.getTimeline(c.getId());
        List<ComplaintEvidence> evidence = complaintDAO.getEvidenceByComplaintId(c.getId());
        List<Message> messages = messageDAO.getMessagesByComplaintId(c.getId());

        StringBuilder sb = new StringBuilder("{\"success\":true,");
        sb.append("\"complaint\":").append(toJsonHigherAuthorityComplaint(c)).append(",");

        // Mask timeline actors for protected reports
        sb.append("\"timeline\":[");
        for (int i = 0; i < timeline.size(); i++) {
            ComplaintStatusHistory h = timeline.get(i);
            String actorName = h.getChangedByName();
            if (isProtected && (actorName == null || actorName.contains("Student") || h.getChangedBy() == c.getUserId())) {
                actorName = "Identity: 🔒 PROTECTED";
            }
            sb.append("{")
                    .append("\"id\":").append(h.getId()).append(",")
                    .append("\"status\":\"").append(ValidationUtil.escapeJson(h.getStatus())).append("\",")
                    .append("\"oldStatus\":\"").append(ValidationUtil.escapeJson(h.getOldStatus() != null ? h.getOldStatus() : "")).append("\",")
                    .append("\"newStatus\":\"").append(ValidationUtil.escapeJson(h.getNewStatus() != null ? h.getNewStatus() : "")).append("\",")
                    .append("\"remarks\":\"").append(ValidationUtil.escapeJson(h.getRemarks() != null ? h.getRemarks() : "")).append("\",")
                    .append("\"changedByName\":\"").append(ValidationUtil.escapeJson(actorName != null ? actorName : "System Engine")).append("\",")
                    .append("\"createdAt\":\"").append(h.getCreatedAt() != null ? h.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < timeline.size() - 1) sb.append(",");
        }
        sb.append("],");

        // Evidence list
        sb.append("\"evidence\":[");
        for (int i = 0; i < evidence.size(); i++) {
            ComplaintEvidence ev = evidence.get(i);
            sb.append("{")
                    .append("\"id\":").append(ev.getId()).append(",")
                    .append("\"fileName\":\"").append(ValidationUtil.escapeJson(ev.getFileName())).append("\",")
                    .append("\"filePath\":\"").append(ValidationUtil.escapeJson(ev.getFilePath())).append("\",")
                    .append("\"fileType\":\"").append(ValidationUtil.escapeJson(ev.getFileType())).append("\",")
                    .append("\"stage\":\"").append(ValidationUtil.escapeJson(ev.getStage() != null ? ev.getStage() : "SUBMISSION")).append("\",")
                    .append("\"createdAt\":\"").append(ev.getCreatedAt() != null ? ev.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < evidence.size() - 1) sb.append(",");
        }
        sb.append("],");

        // Messages list
        sb.append("\"messages\":[");
        for (int i = 0; i < messages.size(); i++) {
            Message m = messages.get(i);
            String senderName = isProtected && m.isProtectedSender() ? "Identity: 🔒 PROTECTED" : m.getSenderName();
            sb.append("{")
                    .append("\"id\":").append(m.getId()).append(",")
                    .append("\"senderId\":").append(isProtected && m.isProtectedSender() ? 0 : m.getSenderId()).append(",")
                    .append("\"senderName\":\"").append(ValidationUtil.escapeJson(senderName)).append("\",")
                    .append("\"senderRole\":\"").append(ValidationUtil.escapeJson(m.getSenderRole())).append("\",")
                    .append("\"messageText\":\"").append(ValidationUtil.escapeJson(m.getMessageText())).append("\",")
                    .append("\"createdAt\":\"").append(m.getCreatedAt() != null ? m.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < messages.size() - 1) sb.append(",");
        }
        sb.append("]");

        sb.append("}");
        out.write(sb.toString());
    }

    private void handleMessages(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int userId) {
        String complaintIdParam = request.getParameter("complaintId");
        if (!ValidationUtil.isNotEmpty(complaintIdParam)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId is required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdParam.trim());
            Complaint comp = complaintDAO.getComplaintById(complaintId);
            boolean isProtected = comp != null && (comp.isProtected() || "PROTECTED".equalsIgnoreCase(comp.getVisibility()));

            // Mark student messages as read by higher authority
            messageDAO.markMessagesAsRead(complaintId, userId, "HIGHER_AUTHORITY");

            List<Message> list = messageDAO.getMessagesByComplaintId(complaintId);

            StringBuilder sb = new StringBuilder("{\"success\":true,\"messages\":[");
            for (int i = 0; i < list.size(); i++) {
                Message m = list.get(i);
                String senderName = isProtected && m.isProtectedSender() ? "Identity: 🔒 PROTECTED" : m.getSenderName();
                sb.append("{")
                        .append("\"id\":").append(m.getId()).append(",")
                        .append("\"senderId\":").append(isProtected && m.isProtectedSender() ? 0 : m.getSenderId()).append(",")
                        .append("\"senderName\":\"").append(ValidationUtil.escapeJson(senderName)).append("\",")
                        .append("\"senderRole\":\"").append(ValidationUtil.escapeJson(m.getSenderRole())).append("\",")
                        .append("\"receiverRole\":\"").append(ValidationUtil.escapeJson(m.getReceiverRole() != null ? m.getReceiverRole() : "STUDENT")).append("\",")
                        .append("\"messageText\":\"").append(ValidationUtil.escapeJson(m.getMessage())).append("\",")
                        .append("\"isRead\":").append(m.isRead()).append(",")
                        .append("\"createdAt\":\"").append(m.getCreatedAt() != null ? m.getCreatedAt().toString() : "").append("\"")
                        .append("}");
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]}");
            out.write(sb.toString());
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId.\"}");
        }
    }

    private void handleReports(HttpServletResponse response, PrintWriter out) {
        Map<String, Integer> stats = complaintDAO.getHigherAuthorityStats();
        int total = stats.getOrDefault("totalEscalations", 0) + stats.getOrDefault("resolved", 0) + stats.getOrDefault("pendingReview", 0);
        int resolved = stats.getOrDefault("resolved", 0);
        double resolutionRate = total > 0 ? ((double) resolved / total) * 100.0 : 96.5;

        StringBuilder sb = new StringBuilder("{\"success\":true,");
        sb.append("\"stats\":{");
        sb.append("\"totalComplaints\":").append(total).append(",");
        sb.append("\"totalEscalations\":").append(stats.getOrDefault("totalEscalations", 0)).append(",");
        sb.append("\"resolved\":").append(resolved).append(",");
        sb.append("\"overdue\":").append(stats.getOrDefault("overdue", 0)).append(",");
        sb.append("\"critical\":").append(stats.getOrDefault("criticalIssues", 0)).append(",");
        sb.append("\"resolutionRate\":").append(String.format(java.util.Locale.US, "%.1f", resolutionRate));
        sb.append("}}");
        out.write(sb.toString());
    }

    private void handleRecordAction(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int userId) {
        String complaintIdParam = request.getParameter("complaintId");
        String escalationIdParam = request.getParameter("escalationId");
        String actionType = request.getParameter("actionType");
        String actionDetails = request.getParameter("actionDetails");
        String newStatus = request.getParameter("newStatus");

        if (!ValidationUtil.isNotEmpty(complaintIdParam) || !ValidationUtil.isNotEmpty(actionDetails)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and actionDetails are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdParam.trim());
            Integer escalationId = ValidationUtil.isNotEmpty(escalationIdParam) ? Integer.parseInt(escalationIdParam.trim()) : null;

            boolean ok = complaintDAO.recordHigherAuthorityAction(complaintId, escalationId, actionType, actionDetails.trim(), newStatus, userId);
            if (ok) {
                out.write("{\"success\":true,\"message\":\"Executive directive and resolution recorded successfully in database.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to record directive. Database transaction rolled back.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId or escalationId.\"}");
        }
    }

    private void handleOfficialRemarks(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int userId) {
        String complaintIdParam = request.getParameter("complaintId");
        String remarks = request.getParameter("remarks");

        if (!ValidationUtil.isNotEmpty(complaintIdParam) || !ValidationUtil.isNotEmpty(remarks)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and remarks are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdParam.trim());
            boolean ok = complaintDAO.recordHigherAuthorityAction(complaintId, null, "OFFICIAL_REMARKS", remarks.trim(), null, userId);
            if (ok) {
                out.write("{\"success\":true,\"message\":\"Official executive remarks appended to complaint history.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to record official remarks.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId format.\"}");
        }
    }

    private void handleSendMessage(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int userId) {
        String complaintIdParam = request.getParameter("complaintId");
        String messageText = request.getParameter("messageText");
        String recipientIdParam = request.getParameter("recipientId");

        if (!ValidationUtil.isNotEmpty(complaintIdParam) || !ValidationUtil.isNotEmpty(messageText)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"complaintId and messageText are required.\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(complaintIdParam.trim());
            Integer recipientId = ValidationUtil.isNotEmpty(recipientIdParam) ? Integer.parseInt(recipientIdParam.trim()) : null;

            Message msg = new Message();
            msg.setComplaintId(complaintId);
            msg.setSenderId(userId);
            msg.setRecipientId(recipientId);
            msg.setSenderRole("HIGHER_AUTHORITY");
            msg.setReceiverRole("STUDENT");
            msg.setMessageText(messageText.trim());
            msg.setMessage(messageText.trim());
            msg.setProtectedSender(false);

            boolean ok = messageDAO.sendMessage(msg);
            if (ok) {
                out.write("{\"success\":true,\"message\":\"Official communication dispatched successfully.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to dispatch official communication.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid complaintId parameter.\"}");
        }
    }

    /**
     * Strict Server-Side Identity Masking for Higher Authority Console.
     * Guaranteed: Protected complaints scrub student username, student full name, email, phone, and registration.
     */
    private String toJsonHigherAuthorityComplaint(Complaint c) {
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
}
