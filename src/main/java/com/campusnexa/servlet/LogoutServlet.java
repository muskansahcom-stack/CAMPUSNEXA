package com.campusnexa.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Handles user logout and session invalidation.
 */
@WebServlet(name = "CampusNexaLogoutServlet", urlPatterns = {"/logout", "/api/auth/logout"})
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    private void processLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        boolean isAjax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With")) ||
                (request.getHeader("Accept") != null && request.getHeader("Accept").contains("application/json"));

        if (isAjax) {
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\":true,\"message\":\"You have been logged out successfully.\"}");
        } else {
            response.sendRedirect(request.getContextPath() + "/login.html?message=You+have+been+logged+out+successfully.");
        }
    }
}
