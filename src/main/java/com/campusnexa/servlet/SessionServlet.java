package com.campusnexa.servlet;

import com.campusnexa.dao.UserDAO;
import com.campusnexa.model.User;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Returns current authenticated session details for frontend dashboards.
 */
@WebServlet(name = "CampusNexaSessionServlet", urlPatterns = {"/api/session"})
public class SessionServlet extends HttpServlet {

    private final UserDAO userDAO;

    public SessionServlet() {
        this(new UserDAO());
    }

    public SessionServlet(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            int userId = (int) session.getAttribute("userId");
            String username = (String) session.getAttribute("username");
            String role = (String) session.getAttribute("role");

            User user = userDAO.findById(userId);
            String fullName = (user != null && user.getFullName() != null) ? user.getFullName() : username;
            String email = (user != null && user.getEmail() != null) ? user.getEmail() : "";
            String dept = (user != null && user.getDepartment() != null) ? user.getDepartment() : "";
            String room = (user != null && user.getRoomNumber() != null) ? user.getRoomNumber() : "";

            response.getWriter().write(String.format(
                    "{\"authenticated\":true,\"userId\":%d,\"username\":\"%s\",\"role\":\"%s\",\"fullName\":\"%s\",\"email\":\"%s\",\"department\":\"%s\",\"roomNumber\":\"%s\"}",
                    userId,
                    ValidationUtil.escapeJson(username),
                    ValidationUtil.escapeJson(role),
                    ValidationUtil.escapeJson(fullName),
                    ValidationUtil.escapeJson(email),
                    ValidationUtil.escapeJson(dept),
                    ValidationUtil.escapeJson(room)
            ));
        } else {
            response.getWriter().write("{\"authenticated\":false}");
        }
    }
}
