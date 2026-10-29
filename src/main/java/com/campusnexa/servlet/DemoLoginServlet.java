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
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Provides 1-click instant demo authentication across all 5 roles.
 */
@WebServlet(name = "CampusNexaDemoLoginServlet", urlPatterns = {"/demo-login"})
public class DemoLoginServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(DemoLoginServlet.class.getName());
    private final UserDAO userDAO;

    public DemoLoginServlet() {
        this(new UserDAO());
    }

    public DemoLoginServlet(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processDemoLogin(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processDemoLogin(request, response);
    }

    private void processDemoLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String roleParam = request.getParameter("role");
        String userParam = request.getParameter("user");

        String role = ValidationUtil.isNotEmpty(roleParam) ? roleParam.trim().toUpperCase() : "STUDENT";
        if (!ValidationUtil.isValidRole(role)) {
            role = "STUDENT";
        }

        String targetUsername;
        if (ValidationUtil.isNotEmpty(userParam)) {
            targetUsername = userParam.trim().toLowerCase();
        } else {
            switch (role) {
                case "ADMIN":
                    targetUsername = "admin";
                    break;
                case "HIGHER_AUTHORITY":
                    targetUsername = "coe_admin";
                    break;
                case "DEPUTY_WARDEN":
                case "WARDEN":
                    targetUsername = "warden1";
                    break;
                case "MAINTENANCE_STAFF":
                case "STAFF":
                    targetUsername = "technician1";
                    break;
                case "STUDENT":
                default:
                    targetUsername = "student1";
                    break;
            }
        }

        // Ensure baseline demo accounts are present
        try {
            userDAO.ensureDemoUsersExist();
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error ensuring demo accounts: " + e.getMessage());
        }

        User user = null;
        try {
            user = userDAO.findByUsername(targetUsername);
            if (user == null) {
                List<User> usersByRole = userDAO.findUsersByRole(role);
                if (!usersByRole.isEmpty()) {
                    user = usersByRole.get(0);
                }
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error finding demo user: " + e.getMessage());
        }

        int userId = (user != null) ? user.getId() : getFallbackIdForRole(role);
        String finalUsername = (user != null) ? user.getUsername() : targetUsername;
        String finalRole = (user != null && user.getRole() != null) ? user.getRole().toUpperCase() : role;
        String fullName = (user != null && user.getFullName() != null) ? user.getFullName() : finalUsername;

        // Invalidate old session
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        // Create new demo session
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", userId);
        session.setAttribute("username", finalUsername);
        session.setAttribute("role", finalRole);
        session.setAttribute("fullName", fullName);

        LOGGER.info(String.format("Demo login successful: username='%s', role='%s', id=%d", finalUsername, finalRole, userId));

        String redirectParam = request.getParameter("redirect");
        String redirectUrl;
        if (ValidationUtil.isNotEmpty(redirectParam)) {
            redirectUrl = request.getContextPath() + "/" + redirectParam.trim();
        } else {
            redirectUrl = RoleAuthorizationFilter.getDashboardForRole(request.getContextPath(), finalRole);
        }
        response.sendRedirect(redirectUrl);
    }

    private int getFallbackIdForRole(String role) {
        switch (role) {
            case "ADMIN": return 1;
            case "STAFF": return 2;
            case "STUDENT": return 3;
            case "WARDEN": return 5;
            case "HIGHER_AUTHORITY": return 6;
            default: return 3;
        }
    }
}
