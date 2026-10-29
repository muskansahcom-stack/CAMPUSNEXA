package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.FeedbackDAO;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.Feedback;
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

/**
 * Enterprise Servlet managing student quality ratings, reviews, and reopen requests.
 */
@WebServlet(name = "FeedbackServlet", urlPatterns = {
        "/api/feedback",
        "/api/feedback/*"
})
public class FeedbackServlet extends HttpServlet {

    private final FeedbackDAO feedbackDAO;
    private final ComplaintDAO complaintDAO;

    public FeedbackServlet() {
        this(new FeedbackDAO(), new ComplaintDAO());
    }

    public FeedbackServlet(FeedbackDAO feedbackDAO, ComplaintDAO complaintDAO) {
        this.feedbackDAO = feedbackDAO;
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

        String complaintIdParam = request.getParameter("complaintId");
        if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                int cId = Integer.parseInt(complaintIdParam.trim());
                Feedback fb = feedbackDAO.getFeedbackByComplaintId(cId);
                if (fb != null) {
                    out.write(toJsonFeedbackList(List.of(fb)));
                } else {
                    out.write("[]");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        out.write("[]");
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

        String complaintNum = request.getParameter("complaintNumber");
        String complaintIdParam = request.getParameter("complaintId");
        String ratingParam = request.getParameter("rating");
        String feedbackParam = request.getParameter("feedback");
        String comments = request.getParameter("comments");
        String actionParam = request.getParameter("action");
        String isReopenedParam = request.getParameter("isReopened");
        String reopenReason = request.getParameter("reopenReason");

        Complaint complaint = null;
        if (ValidationUtil.isNotEmpty(complaintNum)) {
            complaint = complaintDAO.getComplaintByNumber(complaintNum.trim());
        } else if (ValidationUtil.isNotEmpty(complaintIdParam)) {
            try {
                complaint = complaintDAO.getComplaintById(Integer.parseInt(complaintIdParam.trim()));
            } catch (NumberFormatException ignored) {}
        }

        if (complaint == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
            return;
        }

        // Strict Requirement: Only the original student can submit feedback or reopen their complaint
        if (complaint.getUserId() != userId) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. Only the original student who filed this complaint can submit feedback or reopen it.\"}");
            return;
        }

        // Strict Requirement: Only allow feedback/reopen after complaint becomes RESOLVED
        if (!"RESOLVED".equalsIgnoreCase(complaint.getStatus())) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Feedback and reopen actions are only permitted when complaint status is RESOLVED. Current status: " + complaint.getStatus() + "\"}");
            return;
        }

        boolean isReopened = "reopen".equalsIgnoreCase(actionParam) || "true".equalsIgnoreCase(isReopenedParam) || "1".equals(isReopenedParam);

        int rating = isReopened ? 1 : 5;
        if (ValidationUtil.isNotEmpty(ratingParam)) {
            try {
                rating = Integer.parseInt(ratingParam.trim());
                if (rating < 1) rating = 1;
                if (rating > 5) rating = 5;
            } catch (NumberFormatException ignored) {}
        }

        String feedbackText = ValidationUtil.isNotEmpty(feedbackParam) ? feedbackParam.trim() : (ValidationUtil.isNotEmpty(comments) ? comments.trim() : "");

        Feedback fb = new Feedback();
        fb.setComplaintId(complaint.getId());
        fb.setStudentId(userId);
        fb.setRating(rating);
        fb.setFeedback(feedbackText);
        fb.setComments(feedbackText);
        fb.setReopened(isReopened);
        fb.setReopenReason(reopenReason != null && !reopenReason.trim().isEmpty() ? reopenReason.trim() : (isReopened ? feedbackText : null));

        boolean ok = feedbackDAO.submitFeedback(fb);
        if (ok) {
            if (isReopened) {
                try {
                    new com.campusnexa.service.NotificationService().notifyComplaintReopened(complaint, fb.getReopenReason());
                } catch (Exception ignored) {}
            }
            String newStatus = isReopened ? "REOPENED" : "CLOSED";
            String msg = isReopened
                    ? "Complaint #" + complaint.getComplaintNumber() + " reopened successfully. Status updated to REOPENED."
                    : "Resolution confirmed for #" + complaint.getComplaintNumber() + ". Ticket officially marked as CLOSED. Thank you for your feedback!";
            out.write(String.format(
                    "{\"success\":true,\"reopened\":%b,\"status\":\"%s\",\"rating\":%d,\"message\":\"%s\"}",
                    isReopened,
                    newStatus,
                    rating,
                    ValidationUtil.escapeJson(msg)
            ));
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to process feedback and update complaint status.\"}");
        }
    }

    private String toJsonFeedbackList(List<Feedback> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            Feedback f = list.get(i);
            sb.append("{");
            sb.append("\"id\":").append(f.getId()).append(",");
            sb.append("\"complaintId\":").append(f.getComplaintId()).append(",");
            sb.append("\"studentId\":").append(f.getStudentId()).append(",");
            sb.append("\"studentName\":\"").append(ValidationUtil.escapeJson(f.getStudentName() != null ? f.getStudentName() : "")).append("\",");
            sb.append("\"rating\":").append(f.getRating()).append(",");
            sb.append("\"feedback\":\"").append(ValidationUtil.escapeJson(f.getFeedback() != null ? f.getFeedback() : "")).append("\",");
            sb.append("\"comments\":\"").append(ValidationUtil.escapeJson(f.getComments() != null ? f.getComments() : "")).append("\",");
            sb.append("\"isReopened\":").append(f.isReopened()).append(",");
            sb.append("\"reopenReason\":\"").append(ValidationUtil.escapeJson(f.getReopenReason() != null ? f.getReopenReason() : "")).append("\",");
            sb.append("\"createdAt\":\"").append(f.getCreatedAt() != null ? f.getCreatedAt().toString() : "").append("\"");
            sb.append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
