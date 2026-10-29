package com.campusnexa.model;

import java.sql.Timestamp;

public class Feedback {
    private int id;
    private int complaintId;
    private String complaintNumber;
    private String complaintTitle;
    private int studentId;
    private String studentName;
    private int rating;
    private String feedback;
    private String comments;
    private boolean isReopened;
    private String reopenReason;
    private Timestamp createdAt;

    public Feedback() {}

    public Feedback(int id, int complaintId, int studentId, int rating, String comments, boolean isReopened, String reopenReason, Timestamp createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.studentId = studentId;
        this.rating = rating;
        this.comments = comments;
        this.isReopened = isReopened;
        this.reopenReason = reopenReason;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

    public String getComplaintTitle() { return complaintTitle; }
    public void setComplaintTitle(String complaintTitle) { this.complaintTitle = complaintTitle; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getFeedback() { return feedback != null ? feedback : comments; }
    public void setFeedback(String feedback) {
        this.feedback = feedback;
        if (this.comments == null) this.comments = feedback;
    }

    public String getComments() { return comments != null ? comments : feedback; }
    public void setComments(String comments) {
        this.comments = comments;
        if (this.feedback == null) this.feedback = comments;
    }

    public boolean isReopened() { return isReopened; }
    public void setReopened(boolean reopened) { isReopened = reopened; }

    public String getReopenReason() { return reopenReason; }
    public void setReopenReason(String reopenReason) { this.reopenReason = reopenReason; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
