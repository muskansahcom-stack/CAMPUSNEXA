package com.campusnexa.model;

import java.sql.Timestamp;

public class AuditLog {
    private int id;
    private Integer userId;
    private String username;
    private String action;
    private String details;
    private String ipAddress;
    private Timestamp createdAt;

    public AuditLog() {}

    public AuditLog(int id, Integer userId, String username, String action, String details, String ipAddress, Timestamp createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.details = details;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
