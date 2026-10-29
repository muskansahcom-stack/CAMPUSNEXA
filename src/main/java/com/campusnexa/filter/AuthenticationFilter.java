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
 * Filter ensuring users have an authenticated session before accessing protected resources.
 */
@WebFilter(filterName = "AuthenticationFilter", urlPatterns = {
        "/student/*", "/student-dashboard.html", "/dashboard.html", "/report.html", "/track.html", "/issues.jsp",
        "/staff/*", "/staff-dashboard.html",
        "/authority/*", "/authority-dashboard.html",
        "/higher-authority/*", "/higher-authority-dashboard.html",
        "/admin/*", "/admin-dashboard.html",
        "/api/*"
})
public class AuthenticationFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No special initialization
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = uri.substring(contextPath.length());

        // Allow public informational endpoints without session requirement
        if ("/api/session".equals(path) ||
            "/api/categories".equals(path) ||
            "/api/hostels".equals(path) ||
            "/api/facilities".equals(path)) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        boolean isAuthenticated = (session != null && session.getAttribute("userId") != null);

        if (!isAuthenticated) {
            if (path.startsWith("/api/")) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json");
                httpResponse.setCharacterEncoding("UTF-8");
                httpResponse.getWriter().write("{\"error\":\"Unauthorized: Session required\"}");
            } else {
                httpResponse.sendRedirect(contextPath + "/login.html?error=Please+sign+in+to+access+this+portal.");
            }
            return;
        }

        // Apply security response headers
        httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setDateHeader("Expires", 0);
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-Frame-Options", "DENY");

        chain.doFilter(request, response);
    }
}
