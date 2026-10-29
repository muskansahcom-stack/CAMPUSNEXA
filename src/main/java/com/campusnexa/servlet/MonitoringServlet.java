package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationRuleDAO;
import com.campusnexa.model.Complaint;
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
import java.util.logging.Logger;

/**
 * Enterprise Servlet for Campus-Wide Response & Resolution Monitoring.
 * Serves real-time overdue queues, lifecycle timestamp dossiers, and SLA benchmark compliance metrics.
 */
@WebServlet(name = "MonitoringServlet", urlPatterns = {
        "/api/monitoring",
        "/api/monitoring/*"
})
public class MonitoringServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(MonitoringServlet.class.getName());
    private final ComplaintDAO complaintDAO;
    private final EscalationRuleDAO ruleDAO;

    public MonitoringServlet() {
        this(new ComplaintDAO(), new EscalationRuleDAO());
    }

    public MonitoringServlet(ComplaintDAO complaintDAO, EscalationRuleDAO ruleDAO) {
        this.complaintDAO = complaintDAO;
        this.ruleDAO = ruleDAO;
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
        if (role == null || (!role.equalsIgnoreCase("ADMIN") && !role.equalsIgnoreCase("HIGHER_AUTHORITY") &&
                !role.equalsIgnoreCase("WARDEN") && !role.equalsIgnoreCase("DEPUTY_WARDEN"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access restricted to administrative and authority personnel.\"}");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/overdue":
                handleOverdueComplaints(response, out, role);
                break;
            case "/stats":
                handleMonitoringStats(response, out);
                break;
            default:
                // Default: return both stats and summary of overdue
                handleCombinedMonitoring(response, out, role);
                break;
        }
    }

    private void handleOverdueComplaints(HttpServletResponse response, PrintWriter out, String viewerRole) {
        List<Complaint> list = complaintDAO.getOverdueComplaints();

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"success\":true,");
        sb.append("\"policyDisclaimer\":\"").append(ValidationUtil.escapeJson(EscalationRuleDAO.POLICY_DISCLAIMER)).append("\",");
        sb.append("\"count\":").append(list.size()).append(",");
        sb.append("\"overdueComplaints\":[");

        for (int i = 0; i < list.size(); i++) {
            Complaint c = list.get(i);
            sb.append(toJsonOverdueComplaint(c, viewerRole));
            if (i < list.size() - 1) sb.append(",");
        }

        sb.append("]}");
        out.write(sb.toString());
    }

    private void handleMonitoringStats(HttpServletResponse response, PrintWriter out) {
        Map<String, Object> stats = ruleDAO.getResponseMonitoringStats();
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"success\":true,");
        sb.append("\"policyDisclaimer\":\"").append(ValidationUtil.escapeJson(EscalationRuleDAO.POLICY_DISCLAIMER)).append("\",");
        sb.append("\"stats\":{");
        sb.append("\"totalComplaints\":").append(stats.getOrDefault("totalComplaints", 0)).append(",");
        sb.append("\"totalOverdue\":").append(stats.getOrDefault("totalOverdue", 0)).append(",");
        sb.append("\"responseOverdue\":").append(stats.getOrDefault("responseOverdue", 0)).append(",");
        sb.append("\"resolutionOverdue\":").append(stats.getOrDefault("resolutionOverdue", 0)).append(",");
        sb.append("\"avgResponseTimeHours\":").append(stats.getOrDefault("avgResponseTimeHours", 0.0)).append(",");
        sb.append("\"avgResolutionTimeHours\":").append(stats.getOrDefault("avgResolutionTimeHours", 0.0)).append(",");
        sb.append("\"avgResponseTimeFormatted\":\"").append(stats.getOrDefault("avgResponseTimeFormatted", "N/A")).append("\",");
        sb.append("\"avgResolutionTimeFormatted\":\"").append(stats.getOrDefault("avgResolutionTimeFormatted", "N/A")).append("\",");
        sb.append("\"activeRulesCount\":").append(stats.getOrDefault("activeRulesCount", 0));
        sb.append("}");
        sb.append("}");
        out.write(sb.toString());
    }

    private void handleCombinedMonitoring(HttpServletResponse response, PrintWriter out, String viewerRole) {
        Map<String, Object> stats = ruleDAO.getResponseMonitoringStats();
        List<Complaint> list = complaintDAO.getOverdueComplaints();

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"success\":true,");
        sb.append("\"policyDisclaimer\":\"").append(ValidationUtil.escapeJson(EscalationRuleDAO.POLICY_DISCLAIMER)).append("\",");
        sb.append("\"stats\":{");
        sb.append("\"totalComplaints\":").append(stats.getOrDefault("totalComplaints", 0)).append(",");
        sb.append("\"totalOverdue\":").append(stats.getOrDefault("totalOverdue", 0)).append(",");
        sb.append("\"responseOverdue\":").append(stats.getOrDefault("responseOverdue", 0)).append(",");
        sb.append("\"resolutionOverdue\":").append(stats.getOrDefault("resolutionOverdue", 0)).append(",");
        sb.append("\"avgResponseTimeHours\":").append(stats.getOrDefault("avgResponseTimeHours", 0.0)).append(",");
        sb.append("\"avgResolutionTimeHours\":").append(stats.getOrDefault("avgResolutionTimeHours", 0.0)).append(",");
        sb.append("\"avgResponseTimeFormatted\":\"").append(stats.getOrDefault("avgResponseTimeFormatted", "N/A")).append("\",");
        sb.append("\"avgResolutionTimeFormatted\":\"").append(stats.getOrDefault("avgResolutionTimeFormatted", "N/A")).append("\"");
        sb.append("},");
        sb.append("\"overdueComplaints\":[");

        for (int i = 0; i < list.size(); i++) {
            Complaint c = list.get(i);
            sb.append(toJsonOverdueComplaint(c, viewerRole));
            if (i < list.size() - 1) sb.append(",");
        }

        sb.append("]}");
        out.write(sb.toString());
    }

    private String toJsonOverdueComplaint(Complaint c, String viewerRole) {
        boolean isProtected = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
        String reporterDisplay = isProtected ? "PROTECTED_COMPLAINANT" : c.getStudentUsername();
        String studentFullName = isProtected ? "Identity: 🔒 PROTECTED" : c.getStudentFullName();

        return "{" +
                "\"id\":" + c.getId() + "," +
                "\"complaintNumber\":\"" + ValidationUtil.escapeJson(c.getComplaintNumber()) + "\"," +
                "\"title\":\"" + ValidationUtil.escapeJson(c.getTitle()) + "\"," +
                "\"categoryName\":\"" + ValidationUtil.escapeJson(c.getCategoryName()) + "\"," +
                "\"priority\":\"" + ValidationUtil.escapeJson(c.getPriority()) + "\"," +
                "\"status\":\"" + ValidationUtil.escapeJson(c.getStatus()) + "\"," +
                "\"location\":\"" + ValidationUtil.escapeJson(c.getLocation()) + "\"," +
                "\"hostelName\":\"" + ValidationUtil.escapeJson(c.getHostelName() != null ? c.getHostelName() : "") + "\"," +
                "\"roomNumber\":\"" + ValidationUtil.escapeJson(c.getRoomNumber() != null ? c.getRoomNumber() : "") + "\"," +
                "\"isProtected\":" + isProtected + "," +
                "\"studentUsername\":\"" + ValidationUtil.escapeJson(reporterDisplay) + "\"," +
                "\"studentFullName\":\"" + ValidationUtil.escapeJson(studentFullName) + "\"," +
                "\"assignedStaffName\":\"" + ValidationUtil.escapeJson(c.getAssignedStaffName() != null ? c.getAssignedStaffName() : "Unassigned") + "\"," +
                // 4 Lifecycle Timestamps:
                "\"reportedAt\":\"" + (c.getCreatedAt() != null ? c.getCreatedAt().toString() : "") + "\"," +
                "\"assignedAt\":\"" + (c.getAssignedAt() != null ? c.getAssignedAt().toString() : "") + "\"," +
                "\"workStartedAt\":\"" + (c.getWorkStartedAt() != null ? c.getWorkStartedAt().toString() : "") + "\"," +
                "\"resolvedAt\":\"" + (c.getResolvedAt() != null ? c.getResolvedAt().toString() : "") + "\"," +
                // Calculated Times:
                "\"responseTimeSeconds\":" + (c.getResponseTimeSeconds() != null ? c.getResponseTimeSeconds() : "null") + "," +
                "\"resolutionTimeSeconds\":" + (c.getResolutionTimeSeconds() != null ? c.getResolutionTimeSeconds() : "null") + "," +
                "\"responseTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResponseTimeFormatted() != null ? c.getResponseTimeFormatted() : "N/A") + "\"," +
                "\"resolutionTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResolutionTimeFormatted() != null ? c.getResolutionTimeFormatted() : "N/A") + "\"," +
                // Benchmark & Overdue Data:
                "\"expectedResponseHours\":" + (c.getExpectedResponseHours() != null ? c.getExpectedResponseHours() : 6) + "," +
                "\"expectedResolutionHours\":" + (c.getExpectedResolutionHours() != null ? c.getExpectedResolutionHours() : 24) + "," +
                "\"isResponseOverdue\":" + c.isResponseOverdue() + "," +
                "\"isResolutionOverdue\":" + c.isResolutionOverdue() + "," +
                "\"isOverdue\":" + c.isOverdue() + "," +
                "\"overdueReason\":\"" + ValidationUtil.escapeJson(c.getOverdueReason() != null ? c.getOverdueReason() : "Overdue") + "\"" +
                "}";
    }
}
