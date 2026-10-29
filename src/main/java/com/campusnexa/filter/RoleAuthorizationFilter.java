package com.campusnexa.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Filter enforcing strict role-based authorization across the 5 independent dashboards.
 * Reads the role exclusively from the authenticated server-side session.
 */
@WebFilter(filterName = "RoleAuthorizationFilter", urlPatterns = {
        "/student/*", "/student-dashboard.html", "/dashboard.html", "/report.html", "/track.html", "/issues.jsp", "/api/student/*",
        "/staff/*", "/staff-dashboard.html", "/api/staff/*",
        "/authority/*", "/authority-dashboard.html", "/api/authority/*",
        "/higher-authority/*", "/higher-authority-dashboard.html", "/api/higher-authority/*",
        "/admin/*", "/admin-dashboard.html", "/api/admin/*"
})
public class RoleAuthorizationFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No special initialization
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            // Handled by AuthenticationFilter
            chain.doFilter(request, response);
            return;
        }

        String role = (String) session.getAttribute("role");
        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = uri.substring(contextPath.length());

        if (role == null) {
            session.invalidate();
            httpResponse.sendRedirect(contextPath + "/login.html?error=Invalid+session+role");
            return;
        }

        role = role.trim().toUpperCase();

        // 1. Admin paths: strictly ADMIN
        if (path.startsWith("/admin/") || path.startsWith("/admin-dashboard.html") || path.startsWith("/api/admin/")) {
            if (!"ADMIN".equals(role)) {
                denyAccess(httpRequest, httpResponse, "Administrator access required.", role);
                return;
            }
        }

        // 2. Higher Authority paths: HIGHER_AUTHORITY or ADMIN
        if (path.startsWith("/higher-authority/") || path.startsWith("/higher-authority-dashboard.html") || path.startsWith("/api/higher-authority/")) {
            if (!"HIGHER_AUTHORITY".equals(role) && !"ADMIN".equals(role)) {
                denyAccess(httpRequest, httpResponse, "Higher Authority access required.", role);
                return;
            }
        }

        // 3. Local Authority / Warden paths: WARDEN, DEPUTY_WARDEN, or ADMIN
        if (path.startsWith("/authority/") || path.startsWith("/authority-dashboard.html") || path.startsWith("/api/authority/")) {
            if (!"WARDEN".equals(role) && !"DEPUTY_WARDEN".equals(role) && !"ADMIN".equals(role)) {
                denyAccess(httpRequest, httpResponse, "Authority access required.", role);
                return;
            }
        }

        // 4. Maintenance Staff paths: STAFF, MAINTENANCE_STAFF, or ADMIN
        if (path.startsWith("/staff/") || path.startsWith("/staff-dashboard.html") || path.startsWith("/api/staff/")) {
            if (!"STAFF".equals(role) && !"MAINTENANCE_STAFF".equals(role) && !"ADMIN".equals(role)) {
                denyAccess(httpRequest, httpResponse, "Staff Technician access required.", role);
                return;
            }
        }

        // 5. Student paths: STUDENT (or ADMIN for support view)
        if (path.startsWith("/student/") || path.startsWith("/student-dashboard.html") || path.startsWith("/dashboard.html") ||
            path.startsWith("/report.html") || path.startsWith("/track.html") || path.startsWith("/issues.jsp") || path.startsWith("/api/student/")) {
            if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
                denyAccess(httpRequest, httpResponse, "Student access required.", role);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private void denyAccess(HttpServletRequest request, HttpServletResponse response, String message, String currentRole) throws IOException {
        String contextPath = request.getContextPath();
        String path = request.getRequestURI().substring(contextPath.length());

        if (path.startsWith("/api/")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"Forbidden: " + message + "\"}");
        } else {
            String targetDashboard = getDashboardForRole(contextPath, currentRole);
            response.sendRedirect(targetDashboard + "?error=Access+denied:+" + java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    public static String getDashboardForRole(String contextPath, String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return contextPath + "/admin-dashboard.html";
        } else if ("HIGHER_AUTHORITY".equalsIgnoreCase(role)) {
            return contextPath + "/higher-authority-dashboard.html";
        } else if ("DEPUTY_WARDEN".equalsIgnoreCase(role) || "WARDEN".equalsIgnoreCase(role)) {
            return contextPath + "/authority-dashboard.html";
        } else if ("MAINTENANCE_STAFF".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role)) {
            return contextPath + "/staff-dashboard.html";
        } else {
            return contextPath + "/student-dashboard.html";
        }
    }
}
