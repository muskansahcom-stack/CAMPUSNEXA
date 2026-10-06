package com.campusnexa.model;

import java.sql.Timestamp;

public class MaintenanceStaff {
    private int id;
    private int userId;
    private String username;
    private String fullName;
    private String email;
    private String specialty;
    private boolean isAvailable;
    private int activeTasks;
    private Timestamp createdAt;

    public MaintenanceStaff() {}

    public MaintenanceStaff(int id, int userId, String username, String fullName, String email, String specialty, boolean isAvailable, int activeTasks, Timestamp createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.specialty = specialty;
        this.isAvailable = isAvailable;
        this.activeTasks = activeTasks;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public int getActiveTasks() { return activeTasks; }
    public void setActiveTasks(int activeTasks) { this.activeTasks = activeTasks; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
