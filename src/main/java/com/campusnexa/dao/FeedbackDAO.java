package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Feedback;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for complaint resolution ratings and ticket reopen requests.
 */
public class FeedbackDAO {

    private static final Logger LOGGER = Logger.getLogger(FeedbackDAO.class.getName());

    public boolean submitFeedback(Feedback fb) {
        String insertSql = "INSERT INTO feedback (" +
                "complaint_id, student_id, rating, feedback, comments, is_reopened, reopen_reason, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) " +
                "ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback), comments = VALUES(comments), " +
                "is_reopened = VALUES(is_reopened), reopen_reason = VALUES(reopen_reason), created_at = CURRENT_TIMESTAMP";

        String updateComplaintSql;
        String newStatus;
        if (fb.isReopened()) {
            newStatus = "REOPENED";
            updateComplaintSql = "UPDATE complaints SET status = 'REOPENED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'RESOLVED'";
        } else {
            newStatus = "CLOSED";
            updateComplaintSql = "UPDATE complaints SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'RESOLVED'";
        }

        String historySql = "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, status, remarks, changed_by, created_at) " +
                            "VALUES (?, 'RESOLVED', ?, ?, ?, ?, CURRENT_TIMESTAMP)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Verify complaint is in RESOLVED status and update it
            try (PreparedStatement psComp = conn.prepareStatement(updateComplaintSql)) {
                psComp.setInt(1, fb.getComplaintId());
                int updatedRows = psComp.executeUpdate();
                if (updatedRows == 0) {
                    LOGGER.warning("Complaint " + fb.getComplaintId() + " could not be transitioned to " + newStatus + " because its current status is not RESOLVED.");
                    conn.rollback();
                    return false;
                }
            }

            // 2. Persist feedback record
            String feedbackContent = fb.getFeedback() != null ? fb.getFeedback().trim() : (fb.getComments() != null ? fb.getComments().trim() : "");
            try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, fb.getComplaintId());
                ps.setInt(2, fb.getStudentId());
                ps.setInt(3, fb.getRating() > 0 ? fb.getRating() : (fb.isReopened() ? 1 : 5));
                ps.setString(4, feedbackContent);
                ps.setString(5, feedbackContent);
                ps.setBoolean(6, fb.isReopened());
                ps.setString(7, fb.getReopenReason() != null ? fb.getReopenReason() : (fb.isReopened() ? feedbackContent : null));

                int rows = ps.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return false;
                }
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        fb.setId(rs.getInt(1));
                    }
                }
            }

            // 3. Insert status history transition record
            try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                psHist.setInt(1, fb.getComplaintId());
                psHist.setString(2, newStatus);
                psHist.setString(3, newStatus);
                String remarks = fb.isReopened()
                        ? "Complaint reopened by student: " + (feedbackContent.isEmpty() ? "Issue still exists" : feedbackContent)
                        : "Resolution confirmed by student (" + (fb.getRating() > 0 ? fb.getRating() : 5) + "-star rating)" +
                          (feedbackContent.isEmpty() ? "" : " — " + feedbackContent);
                psHist.setString(4, remarks);
                psHist.setInt(5, fb.getStudentId());
                psHist.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error submitting feedback for complaint: " + fb.getComplaintId(), e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ignored) {}
            }
        }
    }

    public Feedback getFeedbackByComplaintId(int complaintId) {
        String sql = getBaseQuery() + " WHERE f.complaint_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, complaintId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapFeedback(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching feedback for complaint: " + complaintId, e);
        }
        return null;
    }

    public List<Feedback> getAllFeedback() {
        List<Feedback> list = new ArrayList<>();
        String sql = getBaseQuery() + " ORDER BY f.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapFeedback(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all feedback", e);
        }
        return list;
    }

    public double getAverageRating() {
        String sql = "SELECT AVG(rating) FROM feedback WHERE is_reopened = FALSE";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getDouble(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error calculating average feedback rating", e);
        }
        return 5.0;
    }

    private String getBaseQuery() {
        return "SELECT f.id, f.complaint_id, c.complaint_number, c.title AS complaint_title, " +
               "f.student_id, u.full_name AS student_name, f.rating, f.feedback, f.comments, " +
               "f.is_reopened, f.reopen_reason, f.created_at " +
               "FROM feedback f " +
               "JOIN complaints c ON f.complaint_id = c.id " +
               "JOIN users u ON f.student_id = u.id";
    }

    private Feedback mapFeedback(ResultSet rs) throws SQLException {
        Feedback f = new Feedback();
        f.setId(rs.getInt("id"));
        f.setComplaintId(rs.getInt("complaint_id"));
        f.setComplaintNumber(rs.getString("complaint_number"));
        f.setComplaintTitle(rs.getString("complaint_title"));
        f.setStudentId(rs.getInt("student_id"));
        f.setStudentName(rs.getString("student_name"));
        f.setRating(rs.getInt("rating"));
        f.setFeedback(rs.getString("feedback"));
        f.setComments(rs.getString("comments"));
        f.setReopened(rs.getBoolean("is_reopened"));
        f.setReopenReason(rs.getString("reopen_reason"));
        f.setCreatedAt(rs.getTimestamp("created_at"));
        return f;
    }
}
