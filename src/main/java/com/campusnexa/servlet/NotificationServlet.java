package com.campusnexa.servlet;

import com.campusnexa.dao.NotificationDAO;
import com.campusnexa.model.Notification;
import com.campusnexa.model.NotificationType;
import com.campusnexa.service.NotificationService;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise Servlet managing database-backed notifications and alert broadcasts.
 * Supports retrieval, unread counts, mark-as-read, and administrative system alerts.
 */
@WebServlet(name = "NotificationServlet", urlPatterns = {
        "/api/notifications",
        "/api/notifications/*"
})
public class NotificationServlet extends HttpServlet {

    private final NotificationService notificationService;
    private final NotificationDAO notificationDAO;

    public NotificationServlet() {
        this(new NotificationService(), new NotificationDAO());
    }

    public NotificationServlet(NotificationService notificationService, NotificationDAO notificationDAO) {
        this.notificationService = notificationService;
        this.notificationDAO = notificationDAO;
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
            out.write("{\"error\":\"Authentication required\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String pathInfo = request.getPathInfo();
        String unreadOnly = request.getParameter("unread");

        // 1. Unread count endpoint: /api/notifications/count or /api/notifications/unread-count
        if ("/count".equals(pathInfo) || "/unread-count".equals(pathInfo) || "count".equalsIgnoreCase(unreadOnly)) {
            int count = notificationDAO.getUnreadCount(userId);
            out.write("{\"unreadCount\":" + count + "}");
            return;
        }

        // 2. Paginated / filtered notification list
        int limit = 50;
        int offset = 0;
        String limitParam = request.getParameter("limit");
        String offsetParam = request.getParameter("offset");
        if (ValidationUtil.isNotEmpty(limitParam)) {
            try {
                int l = Integer.parseInt(limitParam.trim());
                if (l > 0 && l <= 100) limit = l;
            } catch (NumberFormatException ignored) {}
        }
        if (ValidationUtil.isNotEmpty(offsetParam)) {
            try {
                int o = Integer.parseInt(offsetParam.trim());
                if (o >= 0) offset = o;
            } catch (NumberFormatException ignored) {}
        }

        boolean isUnread = "true".equalsIgnoreCase(unreadOnly) || "1".equals(unreadOnly);
        List<Notification> notifications;
        if (isUnread) {
            notifications = notificationDAO.getUnreadNotificationsByUserId(userId);
        } else {
            notifications = notificationDAO.getNotificationsByUser(userId, limit, offset);
        }

        // Optional filter by type
        String typeFilter = request.getParameter("type");
        if (ValidationUtil.isNotEmpty(typeFilter) && !"ALL".equalsIgnoreCase(typeFilter)) {
            List<Notification> filtered = new ArrayList<>();
            for (Notification n : notifications) {
                if (typeFilter.equalsIgnoreCase(n.getNotificationType())) {
                    filtered.add(n);
                }
            }
            notifications = filtered;
        }

        int unreadTotal = notificationDAO.getUnreadCount(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"unreadCount\":").append(unreadTotal).append(",");
        sb.append("\"notifications\":[");
        for (int i = 0; i < notifications.size(); i++) {
            Notification n = notifications.get(i);
            sb.append("{");
            sb.append("\"id\":").append(n.getId()).append(",");
            sb.append("\"notificationId\":").append(n.getId()).append(",");
            sb.append("\"recipientUserId\":").append(n.getRecipientUserId()).append(",");
            sb.append("\"userId\":").append(n.getUserId()).append(",");
            sb.append("\"complaintId\":").append(n.getComplaintId() != null ? n.getComplaintId() : "null").append(",");
            sb.append("\"notificationType\":\"").append(ValidationUtil.escapeJson(n.getNotificationType())).append("\",");
            sb.append("\"title\":\"").append(ValidationUtil.escapeJson(n.getTitle())).append("\",");
            sb.append("\"message\":\"").append(ValidationUtil.escapeJson(n.getMessage())).append("\",");
            sb.append("\"linkUrl\":\"").append(ValidationUtil.escapeJson(n.getLinkUrl() != null ? n.getLinkUrl() : "")).append("\",");
            sb.append("\"isRead\":").append(n.isRead()).append(",");
            sb.append("\"priority\":\"").append(ValidationUtil.escapeJson(n.getPriority() != null ? n.getPriority() : "MEDIUM")).append("\",");
            sb.append("\"createdAt\":\"").append(n.getCreatedAt() != null ? n.getCreatedAt().toString() : "").append("\",");
            sb.append("\"readAt\":\"").append(n.getReadAt() != null ? n.getReadAt().toString() : "").append("\"");
            sb.append("}");
            if (i < notifications.size() - 1) sb.append(",");
        }
        sb.append("]}");

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
            out.write("{\"success\":false,\"message\":\"Session expired\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        String action = request.getParameter("action");
        String idParam = request.getParameter("id");
        String pathInfo = request.getPathInfo();

        // 1. Mark All as Read
        if ("markAllRead".equalsIgnoreCase(action) || "/read-all".equals(pathInfo)) {
            boolean ok = notificationDAO.markAllAsRead(userId);
            out.write("{\"success\":" + ok + ",\"message\":\"All notifications marked as read.\"}");
            return;
        }

        // 2. Mark Single Notification as Read
        if ("markRead".equalsIgnoreCase(action) || "read".equalsIgnoreCase(action) || "/read".equals(pathInfo)) {
            if (ValidationUtil.isNotEmpty(idParam)) {
                try {
                    int notifId = Integer.parseInt(idParam.trim());
                    boolean ok = notificationDAO.markAsRead(notifId, userId);
                    out.write("{\"success\":" + ok + ",\"message\":\"Notification marked as read.\"}");
                    return;
                } catch (NumberFormatException ignored) {}
            }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Valid notification ID required\"}");
            return;
        }

        // 3. Delete Notification
        if ("delete".equalsIgnoreCase(action) || "/delete".equals(pathInfo)) {
            if (ValidationUtil.isNotEmpty(idParam)) {
                try {
                    int notifId = Integer.parseInt(idParam.trim());
                    boolean ok = notificationDAO.deleteNotification(notifId, userId);
                    out.write("{\"success\":" + ok + ",\"message\":\"Notification deleted.\"}");
                    return;
                } catch (NumberFormatException ignored) {}
            }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Valid notification ID required\"}");
            return;
        }

        // 4. Admin Broadcast System Alert (RBAC enforced)
        if ("broadcastAlert".equalsIgnoreCase(action) || "/alert".equals(pathInfo)) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Forbidden: Only administrators can broadcast system alerts.\"}");
                return;
            }

            String alertTitle = request.getParameter("title");
            String alertBody = request.getParameter("message");
            String alertPrio = request.getParameter("priority");

            if (!ValidationUtil.isNotEmpty(alertTitle) || !ValidationUtil.isNotEmpty(alertBody)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\":false,\"message\":\"Title and message are required for alert broadcast.\"}");
                return;
            }

            int dispatched = notificationDAO.broadcastSystemAlert(
                    alertTitle.trim(),
                    alertBody.trim(),
                    ValidationUtil.isNotEmpty(alertPrio) ? alertPrio.trim() : "HIGH",
                    null // Dispatches to all active users
            );

            out.write("{\"success\":true,\"dispatchedCount\":" + dispatched + ",\"message\":\"System alert successfully broadcast to " + dispatched + " users.\"}");
            return;
        }

        // Fallback for id-based mark as read
        if (ValidationUtil.isNotEmpty(idParam)) {
            try {
                int notifId = Integer.parseInt(idParam.trim());
                boolean ok = notificationDAO.markAsRead(notifId, userId);
                out.write("{\"success\":" + ok + "}");
                return;
            } catch (NumberFormatException ignored) {}
        }

        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        out.write("{\"success\":false,\"message\":\"Invalid notification action or ID\"}");
    }
}
