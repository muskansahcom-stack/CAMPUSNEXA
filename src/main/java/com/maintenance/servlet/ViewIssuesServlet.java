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
 * Servlet to retrieve and render maintenance issues strictly belonging to the currently logged-in user.
 * Guarantees that userId is read solely from HttpSession to prevent data leakage across users.
 */
@WebServlet(name = "ViewIssuesServlet", urlPatterns = {"/myIssues", "/issues"})
public class ViewIssuesServlet extends HttpServlet {

    private final MaintenanceIssueDAO issueDAO;

    public ViewIssuesServlet() {
        this(new MaintenanceIssueDAO());
    }

    public ViewIssuesServlet(MaintenanceIssueDAO issueDAO) {
        this.issueDAO = issueDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Enforce active session
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendRedirect(request.getContextPath() + "/login.html?error=Please+log+in+to+view+your+issues.");
            return;
        }

        // IMPORTANT: Strictly retrieve userId from HttpSession (never trust request parameters)
        int userId = (int) session.getAttribute("userId");
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        // Role enforcement: only students can view the student issues page
        if (!"STUDENT".equalsIgnoreCase(role)) {
            if ("ADMIN".equalsIgnoreCase(role)) {
                response.sendRedirect(request.getContextPath() + "/admin-dashboard.html?error=Access+restricted+to+student+accounts.");
            } else if ("STAFF".equalsIgnoreCase(role)) {
                response.sendRedirect(request.getContextPath() + "/staff-dashboard.html?error=Access+restricted+to+student+accounts.");
            } else {
                response.sendRedirect(request.getContextPath() + "/login.html");
            }
            return;
        }

        try {
            // Retrieve issues for the authenticated user from MySQL
            List<MaintenanceIssue> issues = issueDAO.findIssuesByUserId(userId);

            // Bind attributes for JSP rendering
            request.setAttribute("issues", issues);
            request.setAttribute("username", username);
            request.setAttribute("role", role);

            // Forward to issues.jsp
            request.getRequestDispatcher("/issues.jsp").forward(request, response);
        } catch (Exception e) {
            response.sendRedirect(request.getContextPath() + "/dashboard.html?error=Failed+to+load+issues+from+database.");
        }
    }
}
