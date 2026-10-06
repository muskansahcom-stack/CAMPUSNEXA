package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.MessageDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.Message;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * Enterprise Servlet managing digital messages between students and campus authorities.
 * Features 2-way communication, read receipts, and strict server-side protected identity preservation.
 */
@WebServlet(name = "MessageServlet", urlPatterns = {
        "/api/messages",
        "/api/messages/*"
})
public class MessageServlet extends HttpServlet {

    private final MessageDAO messageDAO;
    private final ComplaintDAO complaintDAO;

    public MessageServlet() {
        this(new MessageDAO(), new ComplaintDAO());
    }

    public MessageServlet(MessageDAO messageDAO, ComplaintDAO complaintDAO) {
        this.messageDAO = messageDAO;
        this.complaintDAO = complaintDAO;
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
        String role = (String) session.getAttribute("role");

        // 1. Unread count query
        String unreadParam = request.getParameter("unreadCount");
        if ("true".equalsIgnoreCase(unreadParam)) {
            int count = "STUDENT".equalsIgnoreCase(role) ?
                    messageDAO.getUnreadCountForStudent(userId) :
                    messageDAO.getUnreadCountForAuthority();
            out.write(String.format("{\"unreadCount\":%d}", count));
            return;
        }

        // 2. Specific complaint discussion thread
        String complaintIdParam = request.getParameter("complaintId");
        if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                int cId = Integer.parseInt(complaintIdParam.trim());
                Complaint c = complaintDAO.getComplaintById(cId);
                if (c == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"error\":\"Complaint ticket not found.\"}");
                    return;
                }

                // Student access control: students can only view threads for their own complaints
                if ("STUDENT".equalsIgnoreCase(role) && c.getUserId() != userId) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"error\":\"Unauthorized access to this complaint communication thread.\"}");
                    return;
                }

                // Automatically mark incoming messages as read upon thread opening
                messageDAO.markMessagesAsRead(cId, userId, role);

                List<Message> list = messageDAO.getMessagesByComplaintId(cId);
                out.write(toJsonMessageList(list, role, userId, c));
                return;
            } catch (NumberFormatException ignored) {}
        }

        // 3. User conversations summary list
        if ("STUDENT".equalsIgnoreCase(role)) {
            List<Map<String, Object>> convs = messageDAO.getStudentConversations(userId);
            out.write(toJsonConversations(convs));
        } else {
            List<Map<String, Object>> convs = messageDAO.getAuthorityConversations();
            out.write(toJsonConversations(convs));
        }
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
        String pathInfo = request.getPathInfo();

        // 1. Mark thread as read endpoint: POST /api/messages/read
        if (pathInfo != null && pathInfo.contains("read")) {
            String complaintIdParam = request.getParameter("complaintId");
            if (ValidationUtil.isNotEmpty(complaintIdParam)) {
                try {
                    int cId = Integer.parseInt(complaintIdParam.trim());
                    messageDAO.markMessagesAsRead(cId, userId, role);
                    out.write("{\"success\":true,\"message\":\"Thread marked as read.\"}");
                    return;
                } catch (NumberFormatException ignored) {}
            }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Valid complaintId is required.\"}");
            return;
        }

        // 2. Send Message endpoint
        String complaintIdParam = request.getParameter("complaintId");
        String messageText = request.getParameter("messageText");
        if (!ValidationUtil.isNotEmpty(messageText)) {
            messageText = request.getParameter("message");
        }
        String receiverRole = request.getParameter("receiverRole");

        if (!ValidationUtil.isNotEmpty(messageText)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Message text is required.\"}");
            return;
        }

        int complaintId = 0;
        if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                complaintId = Integer.parseInt(complaintIdParam.trim());
            } catch (NumberFormatException ignored) {}
        }

        if (complaintId <= 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Valid complaint ID is required.\"}");
            return;
        }

        Complaint c = complaintDAO.getComplaintById(complaintId);
        if (c == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
            return;
        }

        // Student can only message on their own tickets
        if ("STUDENT".equalsIgnoreCase(role) && c.getUserId() != userId) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Unauthorized to message on this complaint.\"}");
            return;
        }

        boolean isProtected = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());

        if (!ValidationUtil.isNotEmpty(receiverRole)) {
            receiverRole = "STUDENT".equalsIgnoreCase(role) ? "AUTHORITY" : "STUDENT";
        }

        Message msg = new Message();
        msg.setComplaintId(complaintId);
        msg.setSenderId(userId);
        msg.setSenderRole(role);
        msg.setReceiverRole(receiverRole);
        msg.setMessageText(messageText.trim());
        msg.setMessage(messageText.trim());
        msg.setProtectedSender(isProtected);

        // If authority sends, recipient is the student
        if (!"STUDENT".equalsIgnoreCase(role)) {
            msg.setRecipientId(c.getUserId());
        }

        boolean ok = messageDAO.sendMessage(msg);
        if (ok) {
            out.write(String.format("{\"success\":true,\"messageId\":%d,\"message\":\"Message dispatched successfully.\"}", msg.getId()));
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to dispatch message.\"}");
        }
    }

    /**
     * Strict Identity Masking Serialization:
     * When authority views a protected complaint thread, student name is strictly masked to "Identity: 🔒 PROTECTED",
     * and senderId is masked to 0.
     */
    private String toJsonMessageList(List<Message> list, String role, int currentUserId, Complaint complaint) {
        boolean isProtected = complaint.isProtected() || "PROTECTED".equalsIgnoreCase(complaint.getVisibility());
        boolean isAuthorityViewing = !"STUDENT".equalsIgnoreCase(role);

        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            Message m = list.get(i);
            boolean isStudentSender = "STUDENT".equalsIgnoreCase(m.getSenderRole());

            String displayName;
            int serializedSenderId;

            if (isProtected && isAuthorityViewing && isStudentSender) {
                // Identity MUST remain shielded
                displayName = "Identity: 🔒 PROTECTED";
                serializedSenderId = 0;
            } else {
                displayName = m.getSenderName() != null ? m.getSenderName() : ("User #" + m.getSenderId());
                serializedSenderId = m.getSenderId();
            }

            sb.append("{");
            sb.append("\"id\":").append(m.getId()).append(",");
            sb.append("\"complaintId\":").append(m.getComplaintId()).append(",");
            sb.append("\"senderId\":").append(serializedSenderId).append(",");
            sb.append("\"senderName\":\"").append(ValidationUtil.escapeJson(displayName)).append("\",");
            sb.append("\"senderRole\":\"").append(ValidationUtil.escapeJson(m.getSenderRole() != null ? m.getSenderRole() : "")).append("\",");
            sb.append("\"receiverRole\":\"").append(ValidationUtil.escapeJson(m.getReceiverRole() != null ? m.getReceiverRole() : "")).append("\",");
            sb.append("\"messageText\":\"").append(ValidationUtil.escapeJson(m.getMessage())).append("\",");
            sb.append("\"isProtectedSender\":").append(m.isProtectedSender()).append(",");
            sb.append("\"isRead\":").append(m.isRead()).append(",");
            sb.append("\"createdAt\":\"").append(m.getCreatedAt() != null ? m.getCreatedAt().toString() : "").append("\"");
            sb.append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJsonConversations(List<Map<String, Object>> convs) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < convs.size(); i++) {
            Map<String, Object> map = convs.get(i);
            sb.append("{");
            sb.append("\"complaintId\":").append(map.get("complaintId")).append(",");
            sb.append("\"complaintNumber\":\"").append(ValidationUtil.escapeJson(String.valueOf(map.get("complaintNumber")))).append("\",");
            sb.append("\"title\":\"").append(ValidationUtil.escapeJson(String.valueOf(map.get("title")))).append("\",");
            sb.append("\"status\":\"").append(ValidationUtil.escapeJson(String.valueOf(map.get("status")))).append("\",");
            sb.append("\"priority\":\"").append(ValidationUtil.escapeJson(String.valueOf(map.get("priority")))).append("\",");
            sb.append("\"isProtected\":").append(map.get("isProtected")).append(",");
            if (map.containsKey("studentName")) {
                sb.append("\"studentName\":\"").append(ValidationUtil.escapeJson(String.valueOf(map.get("studentName")))).append("\",");
            }
            sb.append("\"totalMessages\":").append(map.get("totalMessages")).append(",");
            sb.append("\"unreadCount\":").append(map.get("unreadCount")).append(",");
            sb.append("\"lastMessage\":\"").append(ValidationUtil.escapeJson(map.get("lastMessage") != null ? String.valueOf(map.get("lastMessage")) : "")).append("\",");
            sb.append("\"lastSenderRole\":\"").append(ValidationUtil.escapeJson(map.get("lastSenderRole") != null ? String.valueOf(map.get("lastSenderRole")) : "")).append("\",");
            sb.append("\"lastMessageAt\":\"").append(ValidationUtil.escapeJson(map.get("lastMessageAt") != null ? String.valueOf(map.get("lastMessageAt")) : "")).append("\"");
            sb.append("}");
            if (i < convs.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
