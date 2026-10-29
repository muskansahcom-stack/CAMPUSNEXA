package com.campusnexa.servlet;

import com.campusnexa.dao.AuditLogDAO;
import com.campusnexa.dao.CategoryDAO;
import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.EscalationRuleDAO;
import com.campusnexa.dao.FacilityDAO;
import com.campusnexa.dao.HostelDAO;
import com.campusnexa.dao.MaintenanceStaffDAO;
import com.campusnexa.dao.SystemSettingDAO;
import com.campusnexa.dao.UserDAO;
import com.campusnexa.model.AuditLog;
import com.campusnexa.model.Category;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.EscalationRule;
import com.campusnexa.model.Facility;
import com.campusnexa.model.Hostel;
import com.campusnexa.model.MaintenanceStaff;
import com.campusnexa.model.User;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Enterprise Administration Servlet for CampusNexa (Phase 18).
 * Enforces strict Java-side role checking (ADMIN only) and explicit RBAC permission verification.
 * Automatically protects confidential student whistleblower identities unless the session administrator
 * holds the explicit 'VIEW_PROTECTED_IDENTITY' permission.
 */
@WebServlet(name = "CampusNexaAdminServlet", urlPatterns = { "/api/admin/*" })
public class AdminServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(AdminServlet.class.getName());

    private final UserDAO userDAO;
    private final ComplaintDAO complaintDAO;
    private final CategoryDAO categoryDAO;
    private final FacilityDAO facilityDAO;
    private final HostelDAO hostelDAO;
    private final MaintenanceStaffDAO staffDAO;
    private final EscalationRuleDAO ruleDAO;
    private final SystemSettingDAO settingDAO;
    private final AuditLogDAO auditDAO;

    public AdminServlet() {
        this.userDAO = new UserDAO();
        this.complaintDAO = new ComplaintDAO();
        this.categoryDAO = new CategoryDAO();
        this.facilityDAO = new FacilityDAO();
        this.hostelDAO = new HostelDAO();
        this.staffDAO = new MaintenanceStaffDAO();
        this.ruleDAO = new EscalationRuleDAO();
        this.settingDAO = new SystemSettingDAO();
        this.auditDAO = new AuditLogDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        User adminUser = authenticateAdmin(request, response);
        if (adminUser == null) return;

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/") || pathInfo.equals("/metrics")) {
            handleGetMetrics(request, response, adminUser);
        } else if (pathInfo.equals("/users")) {
            handleGetUsers(request, response, adminUser);
        } else if (pathInfo.equals("/permissions")) {
            handleGetPermissions(request, response, adminUser);
        } else if (pathInfo.equals("/categories")) {
            handleGetCategories(request, response, adminUser);
        } else if (pathInfo.equals("/facilities")) {
            handleGetFacilities(request, response, adminUser);
        } else if (pathInfo.equals("/hostels")) {
            handleGetHostels(request, response, adminUser);
        } else if (pathInfo.equals("/staff")) {
            handleGetStaff(request, response, adminUser);
        } else if (pathInfo.equals("/escalation-rules")) {
            handleGetEscalationRules(request, response, adminUser);
        } else if (pathInfo.equals("/settings")) {
            handleGetSettings(request, response, adminUser);
        } else if (pathInfo.equals("/reports")) {
            handleGetReports(request, response, adminUser);
        } else if (pathInfo.equals("/audit-logs")) {
            handleGetAuditLogs(request, response, adminUser);
        } else if (pathInfo.equals("/issues")) {
            handleGetIssues(request, response, adminUser);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"success\":false,\"error\":\"Admin endpoint not found: " + pathInfo + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        User adminUser = authenticateAdmin(request, response);
        if (adminUser == null) return;

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        if (pathInfo.equals("/users")) {
            handlePostUsers(request, response, adminUser);
        } else if (pathInfo.equals("/permissions")) {
            handlePostPermissions(request, response, adminUser);
        } else if (pathInfo.equals("/categories")) {
            handlePostCategories(request, response, adminUser);
        } else if (pathInfo.equals("/facilities")) {
            handlePostFacilities(request, response, adminUser);
        } else if (pathInfo.equals("/hostels")) {
            handlePostHostels(request, response, adminUser);
        } else if (pathInfo.equals("/staff")) {
            handlePostStaff(request, response, adminUser);
        } else if (pathInfo.equals("/escalation-rules")) {
            handlePostEscalationRules(request, response, adminUser);
        } else if (pathInfo.equals("/settings")) {
            handlePostSettings(request, response, adminUser);
        } else if (pathInfo.equals("/assign")) {
            handlePostAssign(request, response, adminUser);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"success\":false,\"error\":\"Admin action endpoint not found\"}");
        }
    }

    // =========================================================================
    // Authentication & Explicit Permission Checking
    // =========================================================================

    private User authenticateAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"success\":false,\"error\":\"Authentication required\"}");
            return null;
        }

        String role = (String) session.getAttribute("role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"success\":false,\"error\":\"Administrator privileges required\"}");
            return null;
        }

        int userId = (int) session.getAttribute("userId");
        User user = userDAO.findById(userId);
        if (user == null || !user.isActive()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"success\":false,\"error\":\"User account is disabled or inactive\"}");
            return null;
        }
        return user;
    }

    private boolean verifyPermission(User adminUser, String permCode, HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!userDAO.hasPermission(adminUser.getId(), permCode)) {
            auditDAO.logAction(adminUser.getId(), "PERMISSION_DENIED",
                    "Admin " + adminUser.getUsername() + " attempted action requiring explicit permission: " + permCode,
                    getClientIp(request));
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"success\":false,\"error\":\"Forbidden: Missing required explicit permission '" + permCode + "'\"}");
            return false;
        }
        return true;
    }

    // =========================================================================
    // GET Handlers
    // =========================================================================

    private void handleGetMetrics(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Complaint> complaints = complaintDAO.getAllComplaints(null, null, null);
        List<User> users = userDAO.findAllUsers();
        boolean canViewProtected = userDAO.hasPermission(adminUser.getId(), "VIEW_PROTECTED_IDENTITY");
        List<String> perms = userDAO.getUserPermissions(adminUser.getId());

        int totalComplaints = complaints.size();
        int reported = 0, inProgress = 0, resolved = 0, critical = 0, overdue = 0;
        for (Complaint c : complaints) {
            String s = c.getStatus() != null ? c.getStatus().toUpperCase() : "SUBMITTED";
            String p = c.getPriority() != null ? c.getPriority().toUpperCase() : "MEDIUM";
            if ("SUBMITTED".equals(s) || "REPORTED".equals(s)) reported++;
            else if ("IN_PROGRESS".equals(s) || "ASSIGNED".equals(s) || "REOPENED".equals(s)) inProgress++;
            else if ("RESOLVED".equals(s) || "CLOSED".equals(s)) resolved++;
            if ("CRITICAL".equals(p) || "HIGH".equals(p)) critical++;
            if (c.isOverdue()) overdue++;
        }

        int totalUsers = users.size();
        int studentsCount = 0, staffCount = 0, wardenCount = 0, coeCount = 0, adminCount = 0;
        for (User u : users) {
            String r = u.getRole() != null ? u.getRole().toUpperCase() : "STUDENT";
            switch (r) {
                case "STUDENT": studentsCount++; break;
                case "STAFF": case "MAINTENANCE_STAFF": staffCount++; break;
                case "WARDEN": case "DEPUTY_WARDEN": wardenCount++; break;
                case "HIGHER_AUTHORITY": coeCount++; break;
                case "ADMIN": adminCount++; break;
            }
        }

        StringBuilder json = new StringBuilder("{");
        json.append("\"success\":true,");
        json.append("\"admin\":{")
            .append("\"id\":").append(adminUser.getId()).append(",")
            .append("\"username\":\"").append(escape(adminUser.getUsername())).append("\",")
            .append("\"fullName\":\"").append(escape(adminUser.getFullName())).append("\",")
            .append("\"canViewProtectedIdentity\":").append(canViewProtected).append(",")
            .append("\"permissions\":[").append(listToJsonArray(perms)).append("]")
            .append("},");
        json.append("\"metrics\":{")
            .append("\"totalComplaints\":").append(totalComplaints).append(",")
            .append("\"reported\":").append(reported).append(",")
            .append("\"inProgress\":").append(inProgress).append(",")
            .append("\"resolved\":").append(resolved).append(",")
            .append("\"critical\":").append(critical).append(",")
            .append("\"overdue\":").append(overdue).append(",")
            .append("\"totalUsers\":").append(totalUsers).append(",")
            .append("\"studentsCount\":").append(studentsCount).append(",")
            .append("\"staffCount\":").append(staffCount).append(",")
            .append("\"wardenCount\":").append(wardenCount).append(",")
            .append("\"coeCount\":").append(coeCount).append(",")
            .append("\"adminCount\":").append(adminCount)
            .append("}");
        json.append("}");

        response.getWriter().write(json.toString());
    }

    private void handleGetUsers(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        String roleFilter = request.getParameter("role");
        String searchQuery = request.getParameter("search");
        boolean canViewProtected = userDAO.hasPermission(adminUser.getId(), "VIEW_PROTECTED_IDENTITY");

        List<User> list = userDAO.findAllUsers();
        StringBuilder json = new StringBuilder("{\"success\":true,\"canViewProtected\":").append(canViewProtected).append(",\"users\":[");

        int count = 0;
        for (User u : list) {
            if (roleFilter != null && !roleFilter.trim().isEmpty() && !roleFilter.equalsIgnoreCase("ALL")) {
                if (!u.getRole().equalsIgnoreCase(roleFilter.trim())) continue;
            }
            if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                String q = searchQuery.trim().toLowerCase();
                boolean match = (u.getUsername() != null && u.getUsername().toLowerCase().contains(q)) ||
                                (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                                (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(q)) ||
                                (u.getRole() != null && u.getRole().toLowerCase().contains(q));
                if (!match) continue;
            }

            if (count > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(u.getId()).append(",")
                .append("\"username\":\"").append(escape(u.getUsername())).append("\",")
                .append("\"fullName\":\"").append(escape(u.getFullName())).append("\",")
                .append("\"email\":\"").append(escape(u.getEmail())).append("\",")
                .append("\"phone\":\"").append(escape(u.getPhone())).append("\",")
                .append("\"role\":\"").append(escape(u.getRole())).append("\",")
                .append("\"department\":\"").append(escape(u.getDepartment())).append("\",")
                .append("\"roomNumber\":\"").append(escape(u.getRoomNumber())).append("\",")
                .append("\"active\":").append(u.isActive()).append(",")
                .append("\"createdAt\":\"").append(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "").append("\"")
                .append("}");
            count++;
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetPermissions(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Map<String, Object>> allPerms = userDAO.getAllPermissions();
        List<String> adminPerms = userDAO.getUserPermissions(adminUser.getId());
        boolean canViewProtected = userDAO.hasPermission(adminUser.getId(), "VIEW_PROTECTED_IDENTITY");

        // Fetch all explicit user permission grants
        String sql = "SELECT up.user_id, u.username, u.full_name, p.code AS perm_code, p.name AS perm_name, " +
                     "up.granted_by, gb.username AS granted_by_username, up.granted_at " +
                     "FROM user_permissions up " +
                     "JOIN users u ON up.user_id = u.id " +
                     "JOIN permissions p ON up.permission_id = p.id " +
                     "LEFT JOIN users gb ON up.granted_by = gb.id ORDER BY up.granted_at DESC";

        List<Map<String, Object>> userGrants = new ArrayList<>();
        try (Connection conn = com.campusnexa.config.DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> grant = new HashMap<>();
                grant.put("userId", rs.getInt("user_id"));
                grant.put("username", rs.getString("username"));
                grant.put("fullName", rs.getString("full_name"));
                grant.put("permCode", rs.getString("perm_code"));
                grant.put("permName", rs.getString("perm_name"));
                grant.put("grantedBy", rs.getString("granted_by_username") != null ? rs.getString("granted_by_username") : "System");
                grant.put("grantedAt", rs.getTimestamp("granted_at") != null ? rs.getTimestamp("granted_at").toString() : "");
                userGrants.add(grant);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching user_permissions in admin", e);
        }

        StringBuilder json = new StringBuilder("{");
        json.append("\"success\":true,");
        json.append("\"canViewProtected\":").append(canViewProtected).append(",");
        json.append("\"adminPermissions\":[").append(listToJsonArray(adminPerms)).append("],");
        json.append("\"permissions\":[");
        for (int i = 0; i < allPerms.size(); i++) {
            Map<String, Object> p = allPerms.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(p.get("id")).append(",")
                .append("\"code\":\"").append(escape((String) p.get("code"))).append("\",")
                .append("\"name\":\"").append(escape((String) p.get("name"))).append("\",")
                .append("\"description\":\"").append(escape((String) p.get("description"))).append("\",")
                .append("\"category\":\"").append(escape((String) p.get("category"))).append("\"")
                .append("}");
        }
        json.append("],");
        json.append("\"userGrants\":[");
        for (int i = 0; i < userGrants.size(); i++) {
            Map<String, Object> g = userGrants.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"userId\":").append(g.get("userId")).append(",")
                .append("\"username\":\"").append(escape((String) g.get("username"))).append("\",")
                .append("\"fullName\":\"").append(escape((String) g.get("fullName"))).append("\",")
                .append("\"permCode\":\"").append(escape((String) g.get("permCode"))).append("\",")
                .append("\"permName\":\"").append(escape((String) g.get("permName"))).append("\",")
                .append("\"grantedBy\":\"").append(escape((String) g.get("grantedBy"))).append("\",")
                .append("\"grantedAt\":\"").append(escape((String) g.get("grantedAt"))).append("\"")
                .append("}");
        }
        json.append("]}");

        response.getWriter().write(json.toString());
    }

    private void handleGetCategories(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Category> list = categoryDAO.getAllCategories();
        StringBuilder json = new StringBuilder("{\"success\":true,\"categories\":[");
        for (int i = 0; i < list.size(); i++) {
            Category c = list.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(c.getId()).append(",")
                .append("\"code\":\"").append(escape(c.getCode())).append("\",")
                .append("\"name\":\"").append(escape(c.getName())).append("\",")
                .append("\"icon\":\"").append(escape(c.getIcon())).append("\",")
                .append("\"defaultSlaHours\":").append(c.getDefaultSlaHours()).append(",")
                .append("\"description\":\"").append(escape(c.getDescription())).append("\"")
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetFacilities(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Facility> list = facilityDAO.getAllFacilities();
        StringBuilder json = new StringBuilder("{\"success\":true,\"facilities\":[");
        for (int i = 0; i < list.size(); i++) {
            Facility f = list.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(f.getId()).append(",")
                .append("\"name\":\"").append(escape(f.getName())).append("\",")
                .append("\"locationDetails\":\"").append(escape(f.getLocationDetails())).append("\",")
                .append("\"inChargeName\":\"").append(escape(f.getInChargeName())).append("\"")
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetHostels(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Hostel> list = hostelDAO.getAllHostels();
        StringBuilder json = new StringBuilder("{\"success\":true,\"hostels\":[");
        for (int i = 0; i < list.size(); i++) {
            Hostel h = list.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(h.getId()).append(",")
                .append("\"name\":\"").append(escape(h.getName())).append("\",")
                .append("\"type\":\"").append(escape(h.getType())).append("\",")
                .append("\"capacity\":").append(h.getCapacity())
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetStaff(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<MaintenanceStaff> list = staffDAO.getAllStaff();
        StringBuilder json = new StringBuilder("{\"success\":true,\"staff\":[");
        for (int i = 0; i < list.size(); i++) {
            MaintenanceStaff s = list.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(s.getId()).append(",")
                .append("\"userId\":").append(s.getUserId()).append(",")
                .append("\"username\":\"").append(escape(s.getUsername())).append("\",")
                .append("\"fullName\":\"").append(escape(s.getFullName())).append("\",")
                .append("\"email\":\"").append(escape(s.getEmail())).append("\",")
                .append("\"specialty\":\"").append(escape(s.getSpecialty())).append("\",")
                .append("\"available\":").append(s.isAvailable()).append(",")
                .append("\"activeTasks\":").append(s.getActiveTasks())
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetEscalationRules(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<EscalationRule> rules = ruleDAO.getAllRules();
        Map<String, Object> stats = ruleDAO.getResponseMonitoringStats();

        StringBuilder json = new StringBuilder("{");
        json.append("\"success\":true,");
        json.append("\"rules\":[");
        for (int i = 0; i < rules.size(); i++) {
            EscalationRule r = rules.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(r.getId()).append(",")
                .append("\"categoryName\":\"").append(escape(r.getCategoryName())).append("\",")
                .append("\"ruleType\":\"").append(escape(r.getRuleType())).append("\",")
                .append("\"expectedResponseHours\":").append(r.getExpectedResponseHours()).append(",")
                .append("\"expectedResolutionHours\":").append(r.getExpectedResolutionHours()).append(",")
                .append("\"priorityLevel\":\"").append(escape(r.getPriorityLevel())).append("\",")
                .append("\"description\":\"").append(escape(r.getDescription())).append("\",")
                .append("\"policyDisclaimer\":\"").append(escape(r.getPolicyDisclaimer())).append("\",")
                .append("\"active\":").append(r.isActive())
                .append("}");
        }
        json.append("],");
        json.append("\"stats\":{")
            .append("\"totalOverdue\":").append(stats.getOrDefault("totalOverdue", 0)).append(",")
            .append("\"responseOverdue\":").append(stats.getOrDefault("responseOverdue", 0)).append(",")
            .append("\"resolutionOverdue\":").append(stats.getOrDefault("resolutionOverdue", 0)).append(",")
            .append("\"avgResponseHours\":").append(stats.getOrDefault("avgResponseHours", 0.0)).append(",")
            .append("\"avgResolutionHours\":").append(stats.getOrDefault("avgResolutionHours", 0.0)).append(",")
            .append("\"avgResponseTimeFormatted\":\"").append(escape((String) stats.getOrDefault("avgResponseTimeFormatted", "-"))).append("\",")
            .append("\"avgResolutionTimeFormatted\":\"").append(escape((String) stats.getOrDefault("avgResolutionTimeFormatted", "-"))).append("\"")
            .append("}");
        json.append("}");

        response.getWriter().write(json.toString());
    }

    private void handleGetSettings(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        List<Map<String, String>> settings = settingDAO.getAllSettings();
        StringBuilder json = new StringBuilder("{\"success\":true,\"settings\":[");
        for (int i = 0; i < settings.size(); i++) {
            Map<String, String> s = settings.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"key\":\"").append(escape(s.get("key"))).append("\",")
                .append("\"value\":\"").append(escape(s.get("value"))).append("\",")
                .append("\"description\":\"").append(escape(s.get("description"))).append("\",")
                .append("\"updatedAt\":\"").append(escape(s.get("updatedAt"))).append("\"")
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetReports(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "VIEW_REPORTS", request, response)) return;

        List<Complaint> complaints = complaintDAO.getAllComplaints(null, null, null);
        Map<String, Integer> byCategory = new HashMap<>();
        Map<String, Integer> byStatus = new HashMap<>();
        Map<String, Integer> byPriority = new HashMap<>();

        for (Complaint c : complaints) {
            String cat = c.getCategoryName() != null ? c.getCategoryName() : "General";
            byCategory.put(cat, byCategory.getOrDefault(cat, 0) + 1);

            String st = c.getStatus() != null ? c.getStatus() : "SUBMITTED";
            byStatus.put(st, byStatus.getOrDefault(st, 0) + 1);

            String pr = c.getPriority() != null ? c.getPriority() : "MEDIUM";
            byPriority.put(pr, byPriority.getOrDefault(pr, 0) + 1);
        }

        Map<String, Object> stats = ruleDAO.getResponseMonitoringStats();

        StringBuilder json = new StringBuilder("{");
        json.append("\"success\":true,");
        json.append("\"totalComplaints\":").append(complaints.size()).append(",");
        json.append("\"byCategory\":{").append(mapToJsonString(byCategory)).append("},");
        json.append("\"byStatus\":{").append(mapToJsonString(byStatus)).append("},");
        json.append("\"byPriority\":{").append(mapToJsonString(byPriority)).append("},");
        json.append("\"stats\":{")
            .append("\"totalOverdue\":").append(stats.getOrDefault("totalOverdue", 0)).append(",")
            .append("\"responseOverdue\":").append(stats.getOrDefault("responseOverdue", 0)).append(",")
            .append("\"resolutionOverdue\":").append(stats.getOrDefault("resolutionOverdue", 0)).append(",")
            .append("\"avgResponseFormatted\":\"").append(escape((String) stats.getOrDefault("avgResponseTimeFormatted", "-"))).append("\",")
            .append("\"avgResolutionFormatted\":\"").append(escape((String) stats.getOrDefault("avgResolutionTimeFormatted", "-"))).append("\"")
            .append("}");
        json.append("}");

        response.getWriter().write(json.toString());
    }

    private void handleGetAuditLogs(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "VIEW_AUDIT_LOGS", request, response)) return;

        boolean canViewProtected = userDAO.hasPermission(adminUser.getId(), "VIEW_PROTECTED_IDENTITY");
        List<AuditLog> logs = auditDAO.getRecentLogs(100);

        StringBuilder json = new StringBuilder("{\"success\":true,\"canViewProtected\":").append(canViewProtected).append(",\"logs\":[");
        for (int i = 0; i < logs.size(); i++) {
            AuditLog l = logs.get(i);
            if (i > 0) json.append(",");

            String details = l.getDetails();
            String username = l.getUsername();

            // Strict Whistleblower Protection: Mask whistleblower details if admin lacks VIEW_PROTECTED_IDENTITY
            if (!canViewProtected && details != null) {
                if (details.contains("PROTECTED") || details.contains("Confidential") || details.toLowerCase().contains("whistleblower")) {
                    details = "🔒 [Whistleblower Activity - Details Restricted to Authorized Compliance Admins]";
                    if (username != null && !username.equalsIgnoreCase("admin")) {
                        username = "PROTECTED_COMPLAINANT";
                    }
                }
            }

            json.append("{")
                .append("\"id\":").append(l.getId()).append(",")
                .append("\"userId\":").append(l.getUserId() != null ? l.getUserId() : "null").append(",")
                .append("\"username\":\"").append(escape(username)).append("\",")
                .append("\"action\":\"").append(escape(l.getAction())).append("\",")
                .append("\"details\":\"").append(escape(details)).append("\",")
                .append("\"ipAddress\":\"").append(escape(l.getIpAddress())).append("\",")
                .append("\"createdAt\":\"").append(l.getCreatedAt() != null ? l.getCreatedAt().toString() : "").append("\"")
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    private void handleGetIssues(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        boolean canViewProtected = userDAO.hasPermission(adminUser.getId(), "VIEW_PROTECTED_IDENTITY");
        List<Complaint> complaints = complaintDAO.getAllComplaints(null, null, null);

        StringBuilder json = new StringBuilder("{\"success\":true,\"canViewProtected\":").append(canViewProtected).append(",\"issues\":[");
        for (int i = 0; i < complaints.size(); i++) {
            Complaint c = complaints.get(i);
            if (i > 0) json.append(",");

            boolean isProtected = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
            String studentName = c.getStudentFullName() != null ? c.getStudentFullName() : c.getStudentUsername();
            String studentUsername = c.getStudentUsername();
            String roomNumber = c.getRoomNumber();
            String building = c.getBuilding();
            String protectionReason = c.getProtectionReason();

            if (isProtected && !canViewProtected) {
                studentName = "🔒 PROTECTED COMPLAINANT";
                studentUsername = "PROTECTED_COMPLAINANT_" + c.getId();
                roomNumber = "[PROTECTED]";
                building = "[PROTECTED]";
                protectionReason = "[Hidden - Requires VIEW_PROTECTED_IDENTITY]";
            }

            json.append("{")
                .append("\"id\":").append(c.getId()).append(",")
                .append("\"complaintNumber\":\"").append(escape(c.getComplaintNumber())).append("\",")
                .append("\"userId\":").append((isProtected && !canViewProtected) ? 0 : c.getUserId()).append(",")
                .append("\"student\":\"").append(escape(studentName)).append("\",")
                .append("\"studentUsername\":\"").append(escape(studentUsername)).append("\",")
                .append("\"category\":\"").append(escape(c.getCategoryName())).append("\",")
                .append("\"subCategory\":\"").append(escape(c.getSubCategory())).append("\",")
                .append("\"location\":\"").append(escape(c.getLocation())).append("\",")
                .append("\"building\":\"").append(escape(building)).append("\",")
                .append("\"roomNumber\":\"").append(escape(roomNumber)).append("\",")
                .append("\"title\":\"").append(escape(c.getTitle())).append("\",")
                .append("\"description\":\"").append(escape(c.getDescription())).append("\",")
                .append("\"priority\":\"").append(escape(c.getPriority())).append("\",")
                .append("\"status\":\"").append(escape(c.getStatus())).append("\",")
                .append("\"isProtected\":").append(isProtected).append(",")
                .append("\"protectionReason\":\"").append(escape(protectionReason)).append("\",")
                .append("\"assignedStaffId\":").append(c.getAssignedStaffId() != null ? c.getAssignedStaffId() : "null").append(",")
                .append("\"staff\":\"").append(escape(c.getAssignedStaffName())).append("\",")
                .append("\"isOverdue\":").append(c.isOverdue()).append(",")
                .append("\"createdAt\":\"").append(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "").append("\"")
                .append("}");
        }
        json.append("]}");
        response.getWriter().write(json.toString());
    }

    // =========================================================================
    // POST Handlers (Sensitive Operations — Strict Java Backend RBAC)
    // =========================================================================

    private void handlePostUsers(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        String action = request.getParameter("action");
        if (action == null) action = "create";

        String clientIp = getClientIp(request);

        if ("create".equalsIgnoreCase(action)) {
            if (!verifyPermission(adminUser, "MANAGE_USERS", request, response)) return;

            String username = request.getParameter("username");
            String password = request.getParameter("password");
            String fullName = request.getParameter("fullName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String role = request.getParameter("role");
            String department = request.getParameter("department");
            String roomNumber = request.getParameter("roomNumber");

            if (!ValidationUtil.isNotEmpty(username) || !ValidationUtil.isNotEmpty(password) || !ValidationUtil.isNotEmpty(fullName)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Username, password, and full name are required\"}");
                return;
            }

            if (userDAO.findByUsername(username) != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.getWriter().write("{\"success\":false,\"error\":\"Username '" + username + "' is already in use\"}");
                return;
            }

            String normalizedRole = (role != null && ValidationUtil.isValidRole(role)) ? role.trim().toUpperCase() : "STUDENT";
            User newUser = new User();
            newUser.setUsername(username.trim());
            newUser.setPassword(ValidationUtil.sha256(password));
            newUser.setFullName(fullName.trim());
            newUser.setEmail(email != null ? email.trim() : null);
            newUser.setPhone(phone != null ? phone.trim() : null);
            newUser.setRole(normalizedRole);
            newUser.setDepartment(department != null ? department.trim() : null);
            newUser.setRoomNumber(roomNumber != null ? roomNumber.trim() : null);
            newUser.setActive(true);

            boolean created = userDAO.createUser(newUser);
            if (created) {
                // Also update user_roles link
                userDAO.updateUserRole(newUser.getId(), normalizedRole);

                // If role is STAFF, also ensure maintenance_staff entry exists
                if ("STAFF".equals(normalizedRole) || "MAINTENANCE_STAFF".equals(normalizedRole)) {
                    MaintenanceStaff ms = new MaintenanceStaff();
                    ms.setUserId(newUser.getId());
                    ms.setSpecialty(department != null ? department : "General Repairs");
                    ms.setAvailable(true);
                    ms.setActiveTasks(0);
                    staffDAO.createStaff(ms);
                }

                auditDAO.logAction(adminUser.getId(), "USER_CREATED",
                        "Created new user account: " + username + " (Role: " + normalizedRole + ")", clientIp);

                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write("{\"success\":true,\"message\":\"User created successfully\",\"userId\":" + newUser.getId() + "}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to create user in database\"}");
            }

        } else if ("update".equalsIgnoreCase(action)) {
            if (!verifyPermission(adminUser, "MANAGE_USERS", request, response)) return;

            String userIdParam = request.getParameter("userId");
            if (userIdParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing userId\"}");
                return;
            }

            int targetUserId = Integer.parseInt(userIdParam.trim());
            User target = userDAO.findById(targetUserId);
            if (target == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"error\":\"Target user not found\"}");
                return;
            }

            String fullName = request.getParameter("fullName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String department = request.getParameter("department");
            String roomNumber = request.getParameter("roomNumber");

            if (fullName != null) target.setFullName(fullName.trim());
            if (email != null) target.setEmail(email.trim());
            if (phone != null) target.setPhone(phone.trim());
            if (department != null) target.setDepartment(department.trim());
            if (roomNumber != null) target.setRoomNumber(roomNumber.trim());

            boolean ok = userDAO.updateUser(target);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "USER_UPDATED",
                        "Updated user details for: " + target.getUsername() + " (ID: " + targetUserId + ")", clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"User updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update user\"}");
            }

        } else if ("toggle-active".equalsIgnoreCase(action)) {
            if (!verifyPermission(adminUser, "MANAGE_USERS", request, response)) return;

            String userIdParam = request.getParameter("userId");
            String activeParam = request.getParameter("active");
            if (userIdParam == null || activeParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing userId or active parameter\"}");
                return;
            }

            int targetUserId = Integer.parseInt(userIdParam.trim());
            boolean newActive = Boolean.parseBoolean(activeParam.trim());

            if (targetUserId == adminUser.getId() && !newActive) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Administrators cannot deactivate their own active session account\"}");
                return;
            }

            boolean ok = userDAO.toggleUserActive(targetUserId, newActive);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), newActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                        (newActive ? "Activated" : "Deactivated") + " account ID " + targetUserId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Account status updated to " + (newActive ? "ACTIVE" : "INACTIVE") + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update account status\"}");
            }

        } else if ("assign-role".equalsIgnoreCase(action)) {
            if (!verifyPermission(adminUser, "ASSIGN_ROLES", request, response)) return;

            String userIdParam = request.getParameter("userId");
            String newRole = request.getParameter("role");

            if (userIdParam == null || newRole == null || !ValidationUtil.isValidRole(newRole)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Invalid user ID or target role\"}");
                return;
            }

            int targetUserId = Integer.parseInt(userIdParam.trim());
            boolean ok = userDAO.updateUserRole(targetUserId, newRole.trim().toUpperCase());
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "ROLE_ASSIGNED",
                        "Assigned role " + newRole + " to user ID " + targetUserId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Role successfully updated to " + newRole.toUpperCase() + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update user role\"}");
            }

        } else if ("delete".equalsIgnoreCase(action)) {
            if (!verifyPermission(adminUser, "MANAGE_USERS", request, response)) return;

            String userIdParam = request.getParameter("userId");
            if (userIdParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing userId\"}");
                return;
            }

            int targetUserId = Integer.parseInt(userIdParam.trim());
            if (targetUserId == adminUser.getId()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Cannot delete your own account\"}");
                return;
            }

            boolean ok = userDAO.deleteUser(targetUserId);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "USER_DELETED", "Deleted user ID " + targetUserId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"User successfully deleted\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to delete user\"}");
            }

        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"Unsupported user action: " + action + "\"}");
        }
    }

    private void handlePostPermissions(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_PERMISSIONS", request, response)) return;

        String action = request.getParameter("action");
        String targetUserIdParam = request.getParameter("userId");
        String permCode = request.getParameter("permissionCode");
        String clientIp = getClientIp(request);

        if (targetUserIdParam == null || permCode == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"userId and permissionCode are required\"}");
            return;
        }

        int targetUserId = Integer.parseInt(targetUserIdParam.trim());

        if ("grant-user".equalsIgnoreCase(action)) {
            boolean ok = userDAO.grantUserPermission(targetUserId, permCode, adminUser.getId());
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "PERMISSION_GRANTED",
                        "Explicitly granted permission '" + permCode + "' to user ID " + targetUserId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Permission '" + permCode + "' granted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to grant permission\"}");
            }
        } else if ("revoke-user".equalsIgnoreCase(action)) {
            boolean ok = userDAO.revokeUserPermission(targetUserId, permCode);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "PERMISSION_REVOKED",
                        "Revoked permission '" + permCode + "' from user ID " + targetUserId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Permission '" + permCode + "' revoked successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to revoke permission\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"Unknown permission action: " + action + "\"}");
        }
    }

    private void handlePostCategories(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_CATEGORIES", request, response)) return;

        String action = request.getParameter("action");
        String clientIp = getClientIp(request);

        if ("create".equalsIgnoreCase(action)) {
            String code = request.getParameter("code");
            String name = request.getParameter("name");
            String icon = request.getParameter("icon");
            String slaHoursStr = request.getParameter("defaultSlaHours");
            String description = request.getParameter("description");

            if (!ValidationUtil.isNotEmpty(code) || !ValidationUtil.isNotEmpty(name)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Category code and name are required\"}");
                return;
            }

            int slaHours = 24;
            try { if (slaHoursStr != null) slaHours = Integer.parseInt(slaHoursStr.trim()); } catch (NumberFormatException ignored) {}

            Category cat = new Category();
            cat.setCode(code.trim().toUpperCase());
            cat.setName(name.trim());
            cat.setIcon(icon != null && !icon.trim().isEmpty() ? icon.trim() : "📌");
            cat.setDefaultSlaHours(slaHours);
            cat.setDescription(description);

            boolean ok = categoryDAO.createCategory(cat);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "CATEGORY_CREATED", "Created complaint category: " + name, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Category created successfully\",\"id\":" + cat.getId() + "}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to create category in database\"}");
            }

        } else if ("update".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing category id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            Category cat = categoryDAO.getCategoryById(id);
            if (cat == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"error\":\"Category not found\"}");
                return;
            }

            String code = request.getParameter("code");
            String name = request.getParameter("name");
            String icon = request.getParameter("icon");
            String slaHoursStr = request.getParameter("defaultSlaHours");
            String description = request.getParameter("description");

            if (code != null) cat.setCode(code.trim().toUpperCase());
            if (name != null) cat.setName(name.trim());
            if (icon != null) cat.setIcon(icon.trim());
            if (slaHoursStr != null) cat.setDefaultSlaHours(Integer.parseInt(slaHoursStr.trim()));
            if (description != null) cat.setDescription(description.trim());

            boolean ok = categoryDAO.updateCategory(cat);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "CATEGORY_UPDATED", "Updated category: " + cat.getName(), clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Category updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update category\"}");
            }

        } else if ("delete".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing category id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            boolean ok = categoryDAO.deleteCategory(id);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "CATEGORY_DELETED", "Deleted category ID: " + id, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Category deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to delete category\"}");
            }
        }
    }

    private void handlePostFacilities(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_FACILITIES", request, response)) return;

        String action = request.getParameter("action");
        String clientIp = getClientIp(request);

        if ("create".equalsIgnoreCase(action)) {
            String name = request.getParameter("name");
            String locationDetails = request.getParameter("locationDetails");
            String inChargeName = request.getParameter("inChargeName");

            if (!ValidationUtil.isNotEmpty(name)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Facility name is required\"}");
                return;
            }

            Facility f = new Facility();
            f.setName(name.trim());
            f.setLocationDetails(locationDetails != null ? locationDetails.trim() : "");
            f.setInChargeName(inChargeName != null ? inChargeName.trim() : "");

            boolean ok = facilityDAO.createFacility(f);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "FACILITY_CREATED", "Created facility: " + name, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Facility created successfully\",\"id\":" + f.getId() + "}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to create facility in database\"}");
            }

        } else if ("update".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing facility id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            Facility f = facilityDAO.getFacilityById(id);
            if (f == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"error\":\"Facility not found\"}");
                return;
            }

            String name = request.getParameter("name");
            String locationDetails = request.getParameter("locationDetails");
            String inChargeName = request.getParameter("inChargeName");

            if (name != null) f.setName(name.trim());
            if (locationDetails != null) f.setLocationDetails(locationDetails.trim());
            if (inChargeName != null) f.setInChargeName(inChargeName.trim());

            boolean ok = facilityDAO.updateFacility(f);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "FACILITY_UPDATED", "Updated facility ID: " + id, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Facility updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update facility\"}");
            }

        } else if ("delete".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing facility id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            boolean ok = facilityDAO.deleteFacility(id);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "FACILITY_DELETED", "Deleted facility ID: " + id, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Facility deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to delete facility\"}");
            }
        }
    }

    private void handlePostHostels(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_HOSTELS", request, response)) return;

        String action = request.getParameter("action");
        String clientIp = getClientIp(request);

        if ("create".equalsIgnoreCase(action)) {
            String name = request.getParameter("name");
            String type = request.getParameter("type");
            String capacityStr = request.getParameter("capacity");

            if (!ValidationUtil.isNotEmpty(name)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Hostel name is required\"}");
                return;
            }

            int cap = 100;
            try { if (capacityStr != null) cap = Integer.parseInt(capacityStr.trim()); } catch (NumberFormatException ignored) {}

            Hostel h = new Hostel();
            h.setName(name.trim());
            h.setType(type != null ? type.trim().toUpperCase() : "COED");
            h.setCapacity(cap);

            boolean ok = hostelDAO.createHostel(h);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "HOSTEL_CREATED", "Created hostel: " + name, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Hostel created successfully\",\"id\":" + h.getId() + "}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to create hostel in database\"}");
            }

        } else if ("update".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing hostel id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            Hostel h = hostelDAO.getHostelById(id);
            if (h == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"error\":\"Hostel not found\"}");
                return;
            }

            String name = request.getParameter("name");
            String type = request.getParameter("type");
            String capacityStr = request.getParameter("capacity");

            if (name != null) h.setName(name.trim());
            if (type != null) h.setType(type.trim().toUpperCase());
            if (capacityStr != null) h.setCapacity(Integer.parseInt(capacityStr.trim()));

            boolean ok = hostelDAO.updateHostel(h);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "HOSTEL_UPDATED", "Updated hostel ID: " + id, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Hostel updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update hostel\"}");
            }

        } else if ("delete".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Missing hostel id\"}");
                return;
            }
            int id = Integer.parseInt(idStr.trim());
            boolean ok = hostelDAO.deleteHostel(id);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "HOSTEL_DELETED", "Deleted hostel ID: " + id, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Hostel deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to delete hostel\"}");
            }
        }
    }

    private void handlePostStaff(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_STAFF", request, response)) return;

        String action = request.getParameter("action");
        String staffIdStr = request.getParameter("staffId");
        String clientIp = getClientIp(request);

        if (staffIdStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"staffId is required\"}");
            return;
        }

        int staffId = Integer.parseInt(staffIdStr.trim());

        if ("toggle-availability".equalsIgnoreCase(action)) {
            String availStr = request.getParameter("available");
            boolean avail = Boolean.parseBoolean(availStr);
            boolean ok = staffDAO.updateAvailability(staffId, avail);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "STAFF_AVAILABILITY_CHANGED",
                        "Set availability to " + avail + " for staff ID " + staffId, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Staff availability updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update availability\"}");
            }

        } else if ("update-specialty".equalsIgnoreCase(action)) {
            String specialty = request.getParameter("specialty");
            MaintenanceStaff ms = staffDAO.getStaffById(staffId);
            if (ms == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"error\":\"Staff record not found\"}");
                return;
            }
            if (specialty != null) ms.setSpecialty(specialty.trim());
            boolean ok = staffDAO.updateStaff(ms);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "STAFF_SPECIALTY_UPDATED",
                        "Updated specialty for staff ID " + staffId + " to: " + specialty, clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Staff specialty updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update specialty\"}");
            }
        }
    }

    private void handlePostEscalationRules(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "CONFIGURE_ESCALATION", request, response)) return;

        String ruleIdStr = request.getParameter("id");
        String respHoursStr = request.getParameter("expectedResponseHours");
        String resolHoursStr = request.getParameter("expectedResolutionHours");
        String description = request.getParameter("description");
        String clientIp = getClientIp(request);

        if (ruleIdStr == null || respHoursStr == null || resolHoursStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"id, expectedResponseHours, and expectedResolutionHours are required\"}");
            return;
        }

        try {
            int ruleId = Integer.parseInt(ruleIdStr.trim());
            int respHours = Integer.parseInt(respHoursStr.trim());
            int resolHours = Integer.parseInt(resolHoursStr.trim());

            if (respHours <= 0 || resolHours <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\":false,\"error\":\"Benchmark hours must be positive numbers\"}");
                return;
            }

            boolean ok = ruleDAO.updateRule(ruleId, respHours, resolHours, description);
            if (ok) {
                auditDAO.logAction(adminUser.getId(), "ESCALATION_RULE_CONFIGURED",
                        "Updated rule ID " + ruleId + " benchmarks: " + respHours + "h response, " + resolHours + "h resolution",
                        clientIp);
                response.getWriter().write("{\"success\":true,\"message\":\"Escalation rule benchmarks updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to update escalation rule in database\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"Invalid numeric parameters\"}");
        }
    }

    private void handlePostSettings(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "SYSTEM_SETTINGS", request, response)) return;

        String key = request.getParameter("key");
        String value = request.getParameter("value");
        String desc = request.getParameter("description");
        String clientIp = getClientIp(request);

        if (!ValidationUtil.isNotEmpty(key)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"Setting key is required\"}");
            return;
        }

        boolean ok = settingDAO.updateSetting(key, value, desc);
        if (ok) {
            auditDAO.logAction(adminUser.getId(), "SYSTEM_SETTING_UPDATED",
                    "Updated system setting '" + key + "' = '" + value + "'", clientIp);
            response.getWriter().write("{\"success\":true,\"message\":\"System setting updated successfully\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"error\":\"Failed to update system setting\"}");
        }
    }

    private void handlePostAssign(HttpServletRequest request, HttpServletResponse response, User adminUser) throws IOException {
        if (!verifyPermission(adminUser, "MANAGE_STAFF", request, response)) return;

        String issueIdStr = request.getParameter("issueId");
        String staffIdStr = request.getParameter("staffId");
        String clientIp = getClientIp(request);

        if (issueIdStr == null || staffIdStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"issueId and staffId are required\"}");
            return;
        }

        try {
            int complaintId = Integer.parseInt(issueIdStr.replace("#", "").trim());
            int staffUserId = Integer.parseInt(staffIdStr.trim());

            com.campusnexa.dao.AssignmentDAO assignDAO = new com.campusnexa.dao.AssignmentDAO();
            com.campusnexa.model.Assignment assignment = new com.campusnexa.model.Assignment();
            assignment.setComplaintId(complaintId);
            assignment.setStaffId(staffUserId);
            assignment.setAssignedBy(adminUser.getId());
            assignment.setInstructions("Direct admin dispatch");
            boolean ok = assignDAO.createAssignment(assignment);

            if (ok) {
                staffDAO.incrementActiveTasks(staffUserId);
                auditDAO.logAction(adminUser.getId(), "DISPATCH_CONFIRMED",
                        "Admin dispatched complaint ID " + complaintId + " to staff user ID " + staffUserId, clientIp);
                try {
                    Complaint complaint = complaintDAO.getComplaintById(complaintId);
                    if (complaint != null) {
                        new com.campusnexa.service.NotificationService().notifyComplaintAssigned(complaint, staffUserId, "Direct admin dispatch");
                    }
                } catch (Exception ignored) {}
                response.getWriter().write("{\"success\":true,\"message\":\"Technician successfully dispatched\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\":false,\"error\":\"Failed to record assignment in database\"}");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in handlePostAssign", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"error\":\"Assignment failed: " + e.getMessage() + "\"}");
        }
    }

    // =========================================================================
    // Utilities
    // =========================================================================

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null ? ip.split(",")[0].trim() : "127.0.0.1";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String listToJsonArray(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(list.get(i))).append("\"");
        }
        return sb.toString();
    }

    private String mapToJsonString(Map<String, Integer> map) {
        if (map == null || map.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (Map.Entry<String, Integer> e : map.entrySet()) {
            if (count > 0) sb.append(",");
            sb.append("\"").append(escape(e.getKey())).append("\":").append(e.getValue());
            count++;
        }
        return sb.toString();
    }
}
