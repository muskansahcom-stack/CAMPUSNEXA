package com.campusnexa.servlet;

import com.campusnexa.dao.EscalationRuleDAO;
import com.campusnexa.model.EscalationRule;
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
 * Enterprise Servlet for Response and Resolution Monitoring & Escalation Rules.
 * Manages administrator-configurable SLA benchmarks and monitoring statistics.
 *
 * NOTE: Explicit policy disclaimer is included in all responses:
 * "Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy."
 */
@WebServlet(name = "EscalationRuleServlet", urlPatterns = {
        "/api/escalation-rules",
        "/api/escalation-rules/*"
})
public class EscalationRuleServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(EscalationRuleServlet.class.getName());
    private final EscalationRuleDAO ruleDAO;

    public EscalationRuleServlet() {
        this(new EscalationRuleDAO());
    }

    public EscalationRuleServlet(EscalationRuleDAO ruleDAO) {
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

        List<EscalationRule> rules = ruleDAO.getAllRules();
        Map<String, Object> stats = ruleDAO.getResponseMonitoringStats();

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"success\":true,");
        sb.append("\"policyDisclaimer\":\"").append(ValidationUtil.escapeJson(EscalationRuleDAO.POLICY_DISCLAIMER)).append("\",");

        // Stats
        sb.append("\"stats\":{");
        sb.append("\"totalComplaints\":").append(stats.getOrDefault("totalComplaints", 0)).append(",");
        sb.append("\"totalOverdue\":").append(stats.getOrDefault("totalOverdue", 0)).append(",");
        sb.append("\"responseOverdue\":").append(stats.getOrDefault("responseOverdue", 0)).append(",");
        sb.append("\"resolutionOverdue\":").append(stats.getOrDefault("resolutionOverdue", 0)).append(",");
        sb.append("\"avgResponseTimeHours\":").append(stats.getOrDefault("avgResponseTimeHours", 0.0)).append(",");
        sb.append("\"avgResolutionTimeHours\":").append(stats.getOrDefault("avgResolutionTimeHours", 0.0)).append(",");
        sb.append("\"avgResponseTimeFormatted\":\"").append(stats.getOrDefault("avgResponseTimeFormatted", "N/A")).append("\",");
        sb.append("\"avgResolutionTimeFormatted\":\"").append(stats.getOrDefault("avgResolutionTimeFormatted", "N/A")).append("\",");
        sb.append("\"activeRulesCount\":").append(stats.getOrDefault("activeRulesCount", rules.size()));
        sb.append("},");

        // Rules List
        sb.append("\"rules\":[");
        for (int i = 0; i < rules.size(); i++) {
            EscalationRule r = rules.get(i);
            sb.append("{")
                    .append("\"id\":").append(r.getId()).append(",")
                    .append("\"categoryName\":\"").append(ValidationUtil.escapeJson(r.getCategoryName())).append("\",")
                    .append("\"ruleType\":\"").append(ValidationUtil.escapeJson(r.getRuleType())).append("\",")
                    .append("\"expectedResponseHours\":").append(r.getExpectedResponseHours()).append(",")
                    .append("\"expectedResolutionHours\":").append(r.getExpectedResolutionHours()).append(",")
                    .append("\"priorityLevel\":").append(r.getPriorityLevel() != null ? "\"" + ValidationUtil.escapeJson(r.getPriorityLevel()) + "\"" : "null").append(",")
                    .append("\"description\":\"").append(ValidationUtil.escapeJson(r.getDescription() != null ? r.getDescription() : "")).append("\",")
                    .append("\"policyDisclaimer\":\"").append(ValidationUtil.escapeJson(r.getPolicyDisclaimer())).append("\",")
                    .append("\"active\":").append(r.isActive()).append(",")
                    .append("\"createdAt\":\"").append(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "").append("\",")
                    .append("\"updatedAt\":\"").append(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < rules.size() - 1) sb.append(",");
        }
        sb.append("]");

        sb.append("}");
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
            out.write("{\"success\":false,\"message\":\"Authentication required.\"}");
            return;
        }

        String role = (String) session.getAttribute("role");
        if (role == null || (!role.equalsIgnoreCase("ADMIN") && !role.equalsIgnoreCase("HIGHER_AUTHORITY"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Configuration of escalation rules is restricted to System Administrators.\"}");
            return;
        }

        String idStr = request.getParameter("id");
        if (idStr == null || idStr.trim().isEmpty()) {
            idStr = request.getParameter("ruleId");
        }
        String respHoursStr = request.getParameter("expectedResponseHours");
        String resolHoursStr = request.getParameter("expectedResolutionHours");
        String description = request.getParameter("description");

        if (idStr == null || respHoursStr == null || resolHoursStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing required fields: id, expectedResponseHours, expectedResolutionHours.\"}");
            return;
        }

        try {
            int id = Integer.parseInt(idStr.trim());
            int respHours = Integer.parseInt(respHoursStr.trim());
            int resolHours = Integer.parseInt(resolHoursStr.trim());

            if (respHours <= 0 || resolHours <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\":false,\"message\":\"Response and resolution hours must be positive integers.\"}");
                return;
            }

            boolean ok = ruleDAO.updateRule(id, respHours, resolHours, description);
            if (ok) {
                EscalationRule updated = ruleDAO.getRuleById(id);
                out.write(String.format(
                        "{\"success\":true,\"message\":\"Escalation benchmark rule updated successfully.\",\"policyDisclaimer\":\"%s\",\"rule\":{\"id\":%d,\"categoryName\":\"%s\",\"expectedResponseHours\":%d,\"expectedResolutionHours\":%d}}",
                        ValidationUtil.escapeJson(EscalationRuleDAO.POLICY_DISCLAIMER),
                        updated.getId(),
                        ValidationUtil.escapeJson(updated.getCategoryName()),
                        updated.getExpectedResponseHours(),
                        updated.getExpectedResolutionHours()
                ));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to update rule in database.\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid numeric format for id or hours.\"}");
        }
    }
}
