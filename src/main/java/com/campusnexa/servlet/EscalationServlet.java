package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.Escalation;
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
import java.util.Set;

/**
 * Enterprise Servlet managing official complaint escalations to Higher Authority / COE.
 * Implements Phase 14 specifications for REQUEST ESCALATION and real-time student tracking.
 */
@WebServlet(name = "EscalationServlet", urlPatterns = {
        "/api/escalations",
        "/api/escalations/*"
})
public class EscalationServlet extends HttpServlet {

    private final EscalationDAO escalationDAO;
    private final ComplaintDAO complaintDAO;

    // Phase 14: 6 Standard Institutional Escalation Reasons
    public static final Set<String> ALLOWED_REASONS = Set.of(
            "No action taken",
            "Issue still exists",
            "Issue repeatedly occurring",
            "Complaint closed without proper resolution",
            "Local authority did not address the issue",
            "Sensitive issue requiring higher authority"
    );

    public EscalationServlet() {
        this(new EscalationDAO(), new ComplaintDAO());
    }

    public EscalationServlet(EscalationDAO escalationDAO, ComplaintDAO complaintDAO) {
        this.escalationDAO = escalationDAO;
        this.complaintDAO = complaintDAO;
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
            out.write("{\"error\":\"Authentication required\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        // Specific complaint escalation lookup
        String complaintIdParam = request.getParameter("complaintId");
        if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                int cId = Integer.parseInt(complaintIdParam.trim());
                Escalation esc = escalationDAO.getEscalationByComplaintId(cId);
                if (esc != null) {
                    out.write(toJsonEscalation(esc));
                } else {
                    out.write("{\"hasEscalation\":false}");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        List<Escalation> list;
        if ("STUDENT".equalsIgnoreCase(role)) {
            // Student sees only their own raised escalations
            list = escalationDAO.getEscalationsByStudentId(userId);
        } else if ("HIGHER_AUTHORITY".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            String statusFilter = request.getParameter("status");
            list = escalationDAO.getAllEscalations(statusFilter);
        } else {
            // Warden / Staff sees relevant escalations
            list = escalationDAO.getAllEscalations(null);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(toJsonEscalation(list.get(i)));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");

        out.write(sb.toString());
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
            out.write("{\"success\":false,\"message\":\"Session expired\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        String complaintNum = request.getParameter("complaintNumber");
        String complaintIdParam = request.getParameter("complaintId");
        String reason = request.getParameter("reason");
        String notes = request.getParameter("notes");
        String escalationType = request.getParameter("escalationType");

        if (!ValidationUtil.isNotEmpty(reason)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Escalation reason is required.\"}");
            return;
        }

        if (!ALLOWED_REASONS.contains(reason.trim())) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid escalation reason. Must select one of the 6 standard institutional reasons.\"}");
            return;
        }

        Complaint complaint = null;
        if (ValidationUtil.isNotEmpty(complaintNum)) {
            complaint = complaintDAO.getComplaintByNumber(complaintNum.trim());
        } else if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                complaint = complaintDAO.getComplaintById(Integer.parseInt(complaintIdParam.trim()));
            } catch (NumberFormatException ignored) {}
        }

        if (complaint == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
            return;
        }

        // Student can only escalate their own complaints
        if ("STUDENT".equalsIgnoreCase(role) && complaint.getUserId() != userId) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"You can only escalate your own complaints.\"}");
            return;
        }

        // Check if already escalated and still pending
        Escalation existingEsc = escalationDAO.getEscalationByComplaintId(complaint.getId());
        if (existingEsc != null && ("PENDING_REVIEW".equalsIgnoreCase(existingEsc.getStatus()) || "UNDER_REVIEW".equalsIgnoreCase(existingEsc.getStatus()))) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            out.write(String.format("{\"success\":false,\"message\":\"Ticket is already escalated under reference %s and is currently pending Higher Authority review.\"}", existingEsc.getEscalationNumber()));
            return;
        }

        Escalation esc = new Escalation();
        esc.setComplaintId(complaint.getId());
        esc.setRaisedBy(userId);
        esc.setEscalatedBy(userId);
        esc.setFromAuthority("DEPUTY_WARDEN");
        esc.setToAuthority("HIGHER_AUTHORITY");
        esc.setEscalationType(ValidationUtil.isNotEmpty(escalationType) ? escalationType.trim() : "STUDENT_REQUEST");

        String fullReason = reason.trim();
        if (ValidationUtil.isNotEmpty(notes)) {
            fullReason = fullReason + " — " + notes.trim();
        }
        esc.setReason(fullReason);

        boolean ok = escalationDAO.createEscalation(esc);
        if (ok) {
            out.write(String.format(
                    "{\"success\":true,\"escalationNumber\":\"%s\",\"message\":\"Grievance officially escalated to Higher Authority Queue (%s).\"}",
                    ValidationUtil.escapeJson(esc.getEscalationNumber()),
                    ValidationUtil.escapeJson(esc.getEscalationNumber())
            ));
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to process escalation. Database transaction rolled back.\"}");
        }
    }

    private String toJsonEscalation(Escalation e) {
        return "{" +
                "\"id\":" + e.getId() + "," +
                "\"escalationNumber\":\"" + ValidationUtil.escapeJson(e.getEscalationNumber()) + "\"," +
                "\"complaintId\":" + e.getComplaintId() + "," +
                "\"complaintNumber\":\"" + ValidationUtil.escapeJson(e.getComplaintNumber() != null ? e.getComplaintNumber() : "") + "\"," +
                "\"complaintTitle\":\"" + ValidationUtil.escapeJson(e.getComplaintTitle() != null ? e.getComplaintTitle() : "") + "\"," +
                "\"raisedBy\":" + (e.getRaisedBy() != null ? e.getRaisedBy() : e.getEscalatedBy()) + "," +
                "\"fromAuthority\":\"" + ValidationUtil.escapeJson(e.getFromAuthority()) + "\"," +
                "\"toAuthority\":\"" + ValidationUtil.escapeJson(e.getToAuthority()) + "\"," +
                "\"reason\":\"" + ValidationUtil.escapeJson(e.getReason()) + "\"," +
                "\"status\":\"" + ValidationUtil.escapeJson(e.getStatus()) + "\"," +
                "\"remarks\":\"" + ValidationUtil.escapeJson(e.getRemarks() != null ? e.getRemarks() : "") + "\"," +
                "\"actionTaken\":\"" + ValidationUtil.escapeJson(e.getActionTaken() != null ? e.getActionTaken() : "") + "\"," +
                "\"actionByName\":\"" + ValidationUtil.escapeJson(e.getActionByName() != null ? e.getActionByName() : "") + "\"," +
                "\"responseDeadline\":\"" + (e.getResponseDeadline() != null ? e.getResponseDeadline().toString() : "") + "\"," +
                "\"createdAt\":\"" + (e.getCreatedAt() != null ? e.getCreatedAt().toString() : "") + "\"," +
                "\"resolvedAt\":\"" + (e.getResolvedAt() != null ? e.getResolvedAt().toString() : "") + "\"" +
                "}";
    }
}
