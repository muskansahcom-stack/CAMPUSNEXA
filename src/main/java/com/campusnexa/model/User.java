package com.campusnexa.model;

import java.sql.Timestamp;

/**
 * Entity model representing a system user in CampusNexa.
 * Supports the 5 institutional roles: STUDENT, STAFF, WARDEN, HIGHER_AUTHORITY, ADMIN.
 */
public class User {

    private int id;
    private String username;
    private String password;
    private String role;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String roomNumber;
    private boolean active;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public User() {
    }

    public User(int id, String username, String role, String fullName, String email) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
    }

    public User(int id, String username, String password, String role, String fullName,
                String email, String phone, String department, String roomNumber,
                boolean active, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.roomNumber = roomNumber;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                '}';
    }
}
