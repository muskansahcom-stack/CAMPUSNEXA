package com.maintenance.servlet;

import com.maintenance.dao.MaintenanceIssueDAO;
import com.maintenance.model.MaintenanceIssue;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;

/**
 * Controller servlet for Staff Operations.
 * Enforces strict role-based access control (STAFF only) and session isolation.
 * Staff members can only view and update issues assigned to them.
 */
@WebServlet(name = "StaffServlet", urlPatterns = {
        "/api/staff/issues",
        "/api/staff/update-status"
})
public class StaffServlet extends HttpServlet {

    private final MaintenanceIssueDAO issueDAO;

    public StaffServlet() {
        this(new MaintenanceIssueDAO());
    }

    public StaffServlet(MaintenanceIssueDAO issueDAO) {
        this.issueDAO = issueDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Integer staffId = getAuthenticatedStaffId(request, response);
        if (staffId == null) {
            return;
        }

        String uri = request.getRequestURI();
        if (uri.endsWith("/issues")) {
            serveAssignedIssues(staffId, response);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"error\":\"Endpoint not found\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Integer staffId = getAuthenticatedStaffId(request, response);
        if (staffId == null) {
            return;
        }

        String uri = request.getRequestURI();
        if (uri.endsWith("/update-status")) {
            handleUpdateStatus(staffId, request, response);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"error\":\"Endpoint not found\"}");
        }
    }

    private Integer getAuthenticatedStaffId(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized: Session required\"}");
            return null;
        }

        String role = (String) session.getAttribute("role");
        if (!"STAFF".equalsIgnoreCase(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"Forbidden: Staff access required\"}");
            return null;
        }

        Object userIdObj = session.getAttribute("userId");
        if (userIdObj instanceof Integer) {
            return (Integer) userIdObj;
        } else if (userIdObj != null) {
            try {
                return Integer.parseInt(userIdObj.toString());
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\":\"Invalid session user id\"}");
                return null;
            }
        }
        return null;
    }

    private void serveAssignedIssues(int staffId, HttpServletResponse response) throws IOException {
        try {
            List<MaintenanceIssue> issues = issueDAO.findIssuesByStaffId(staffId);
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < issues.size(); i++) {
                MaintenanceIssue issue = issues.get(i);
                String student = issue.getStudentUsername() != null ? issue.getStudentUsername() : "student" + issue.getUserId();

                json.append("{")
                    .append("\"id\":").append(issue.getId()).append(",")
                    .append("\"userId\":").append(issue.getUserId()).append(",")
                    .append("\"student\":\"").append(escapeJson(student)).append("\",")
                    .append("\"title\":\"").append(escapeJson(issue.getTitle())).append("\",")
                    .append("\"description\":\"").append(escapeJson(issue.getDescription())).append("\",")
                    .append("\"location\":\"").append(escapeJson(issue.getLocation())).append("\",")
                    .append("\"priority\":\"").append(escapeJson(issue.getPriority())).append("\",")
                    .append("\"status\":\"").append(escapeJson(issue.getStatus())).append("\",")
                    .append("\"createdAt\":\"").append(issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : "").append("\",")
                    .append("\"updatedAt\":\"").append(issue.getUpdatedAt() != null ? issue.getUpdatedAt().toString() : "").append("\"")
                    .append("}");

                if (i < issues.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");
            response.getWriter().write(json.toString());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Internal error retrieving assigned issues\"}");
        }
    }

    private void handleUpdateStatus(int staffId, HttpServletRequest request, HttpServletResponse response) throws IOException {
        String issueIdParam = request.getParameter("issueId");
        String statusParam = request.getParameter("status");

        if (issueIdParam == null || issueIdParam.trim().isEmpty() ||
            statusParam == null || statusParam.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Missing required parameters: issueId and status\"}");
            return;
        }

        int issueId;
        try {
            issueId = Integer.parseInt(issueIdParam.trim());
            if (issueId <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Invalid issueId: must be positive\"}");
                return;
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid issueId format\"}");
            return;
        }

        String normalizedStatus = statusParam.trim().toUpperCase();
        // Staff allowed transitions are REPORTED -> IN_PROGRESS or IN_PROGRESS -> RESOLVED
        if (!"IN_PROGRESS".equals(normalizedStatus) && !"RESOLVED".equals(normalizedStatus)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid status transition. Staff can only transition to IN_PROGRESS or RESOLVED\"}");
            return;
        }

        try {
            boolean updated = issueDAO.updateIssueStatusByStaff(issueId, staffId, normalizedStatus);
            if (updated) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"success\":true,\"message\":\"Issue status updated to " + normalizedStatus + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Update failed: verify the issue is assigned to you and follows allowed transitions (REPORTED -> IN_PROGRESS -> RESOLVED)\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Database error while updating issue status\"}");
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\b", "\\b")
                    .replace("\f", "\\f")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}
