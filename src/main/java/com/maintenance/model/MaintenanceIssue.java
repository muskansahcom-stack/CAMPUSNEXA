package com.maintenance.model;

import java.sql.Timestamp;

/**
 * Model class representing a Maintenance Issue/Ticket in the Campus Maintenance Management System.
 */
public class MaintenanceIssue {

    private int id;
    private int userId;
    private Integer assignedStaffId;
    private String studentUsername;
    private String assignedStaffUsername;
    private String title;
    private String description;
    private String location;
    private String priority;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public MaintenanceIssue() {
    }

    public MaintenanceIssue(int userId, String title, String description, String location, String priority, String status) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.location = location;
        this.priority = priority;
        this.status = status;
    }

    public MaintenanceIssue(int id, int userId, String title, String description, String location,
                            String priority, String status, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.location = location;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getStudentUsername() {
        return studentUsername;
    }

    public void setStudentUsername(String studentUsername) {
        this.studentUsername = studentUsername;
    }

    public Integer getAssignedStaffId() {
        return assignedStaffId;
    }

    public void setAssignedStaffId(Integer assignedStaffId) {
        this.assignedStaffId = assignedStaffId;
    }

    public String getAssignedStaffUsername() {
        return assignedStaffUsername;
    }

    public void setAssignedStaffUsername(String assignedStaffUsername) {
        this.assignedStaffUsername = assignedStaffUsername;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "MaintenanceIssue{" +
                "id=" + id +
                ", userId=" + userId +
                ", title='" + title + '\'' +
                ", location='" + location + '\'' +
                ", priority='" + priority + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
