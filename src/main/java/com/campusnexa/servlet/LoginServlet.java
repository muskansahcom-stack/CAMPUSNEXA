package com.campusnexa.servlet;

import com.campusnexa.dao.UserDAO;
import com.campusnexa.filter.RoleAuthorizationFilter;
import com.campusnexa.model.User;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handles user authentication across all 5 roles.
 * Dispatches successfully authenticated users to their dedicated role dashboard.
 */
@WebServlet(name = "CampusNexaLoginServlet", urlPatterns = {"/login", "/api/auth/login"})
public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO;

    public LoginServlet() {
        this(new UserDAO());
    }

    public LoginServlet(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            String role = (String) session.getAttribute("role");
            response.sendRedirect(RoleAuthorizationFilter.getDashboardForRole(request.getContextPath(), role));
            return;
        }
        response.sendRedirect(request.getContextPath() + "/login.html");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String expectedRole = request.getParameter("expectedRole");
        String sourcePage = request.getParameter("sourcePage");
        String targetLoginErrorPage = ValidationUtil.isNotEmpty(sourcePage) ? sourcePage.trim() : "login.html";

        boolean isAjax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With")) ||
                (request.getHeader("Accept") != null && request.getHeader("Accept").contains("application/json"));

        if (!ValidationUtil.isNotEmpty(username) || !ValidationUtil.isNotEmpty(password)) {
            sendError(request, response, isAjax, targetLoginErrorPage, "Username and password are required.");
            return;
        }

        try {
            User user = userDAO.findByUsernameAndPassword(username.trim(), password);

            if (user != null) {
                String role = user.getRole() != null ? user.getRole().trim().toUpperCase() : "";

                if (!ValidationUtil.isValidRole(role)) {
                    sendError(request, response, isAjax, targetLoginErrorPage, "Account has an unrecognized role. Contact administrator.");
                    return;
                }

                // If user logged in through a dedicated portal, enforce role matching
                if (ValidationUtil.isNotEmpty(expectedRole)) {
                    String expected = expectedRole.trim().toUpperCase();
                    boolean match = expected.equals(role) ||
                            ("MAINTENANCE_STAFF".equals(expected) && "STAFF".equals(role)) ||
                            ("STAFF".equals(expected) && "MAINTENANCE_STAFF".equals(role)) ||
                            ("DEPUTY_WARDEN".equals(expected) && "WARDEN".equals(role)) ||
                            ("WARDEN".equals(expected) && "DEPUTY_WARDEN".equals(role));
                    if (ValidationUtil.isValidRole(expected) && !match) {
                        sendError(request, response, isAjax, targetLoginErrorPage,
                                "Access denied: Account role is " + role + ". Please sign in using the " + getPortalNameForRole(role) + ".");
                        return;
                    }
                }

                // Invalidate old session to mitigate session fixation attacks
                HttpSession oldSession = request.getSession(false);
                if (oldSession != null) {
                    oldSession.invalidate();
                }

                // Create new authenticated session
                HttpSession session = request.getSession(true);
                session.setAttribute("userId", user.getId());
                session.setAttribute("username", user.getUsername());
                session.setAttribute("role", role);
                session.setAttribute("fullName", user.getFullName());
                session.setAttribute("email", user.getEmail());

                String redirectUrl = RoleAuthorizationFilter.getDashboardForRole(request.getContextPath(), role);

                if (isAjax) {
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(String.format(
                            "{\"success\":true,\"userId\":%d,\"username\":\"%s\",\"role\":\"%s\",\"redirectUrl\":\"%s\"}",
                            user.getId(), ValidationUtil.escapeJson(user.getUsername()), role, redirectUrl
                    ));
                } else {
                    response.sendRedirect(redirectUrl);
                }
            } else {
                sendError(request, response, isAjax, targetLoginErrorPage, "Invalid username or password. Please try again.");
            }
        } catch (Exception e) {
            sendError(request, response, isAjax, targetLoginErrorPage, "A system error occurred during authentication.");
        }
    }

    private String getPortalNameForRole(String role) {
        if ("ADMIN".equalsIgnoreCase(role)) return "Administrator Console";
        if ("HIGHER_AUTHORITY".equalsIgnoreCase(role)) return "Higher Authority / COE Dashboard";
        if ("DEPUTY_WARDEN".equalsIgnoreCase(role) || "WARDEN".equalsIgnoreCase(role)) return "Deputy / Warden Authority Portal";
        if ("MAINTENANCE_STAFF".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role)) return "Staff Technician Portal";
        return "Student Portal";
    }

    private void sendError(HttpServletRequest request, HttpServletResponse response, boolean isAjax,
                           String targetPage, String message) throws IOException {
        if (isAjax) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(String.format("{\"success\":false,\"message\":\"%s\"}", ValidationUtil.escapeJson(message)));
        } else {
            String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String page = ValidationUtil.isNotEmpty(targetPage) ? targetPage : "login.html";
            String separator = page.contains("?") ? "&" : "?";
            response.sendRedirect(request.getContextPath() + "/" + page + separator + "error=" + encoded);
        }
    }
}
