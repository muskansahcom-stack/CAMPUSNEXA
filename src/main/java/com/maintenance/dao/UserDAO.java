package com.maintenance.dao;

import com.maintenance.config.DBConnection;
import com.maintenance.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for User entities.
 */
public class UserDAO {

    private static final Logger LOGGER = Logger.getLogger(UserDAO.class.getName());

    private static final java.util.Set<String> ALLOWED_ROLES = java.util.Set.of("STUDENT", "ADMIN", "STAFF");

    /**
     * Finds a user by username and password.
     *
     * @param username user login handle
     * @param password user password
     * @return User if found and credentials match; null otherwise
     */
    public User findByUsernameAndPassword(String username, String password) {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return null;
        }

        String sql = "SELECT id, username, password, role, created_at FROM users WHERE username = ? AND password = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findByUsernameAndPassword for username: " + username, e);
        }
        return null;
    }

    /**
     * Finds a user by username.
     *
     * @param username user login handle
     * @return User if found; null otherwise
     */
    public User findByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }

        String sql = "SELECT id, username, password, role, created_at FROM users WHERE username = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findByUsername for: " + username, e);
        }
        return null;
    }

    /**
     * Ensures baseline demo accounts exist in the database.
     */
    public void ensureDemoUsersExist() {
        String sql = "INSERT INTO users (username, password, role) VALUES "
                + "('admin', 'admin123', 'ADMIN'), "
                + "('technician1', 'tech123', 'STAFF'), "
                + "('student1', 'student123', 'STUDENT'), "
                + "('student2', 'student123', 'STUDENT') "
                + "ON DUPLICATE KEY UPDATE role = VALUES(role), password = VALUES(password)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to ensure demo users exist in database", e);
        }
    }

    /**
     * Finds a user by primary key ID.
     *
     * @param id user unique ID
     * @return User if found; null otherwise
     */
    public User findById(int id) {
        if (id <= 0) {
            return null;
        }

        String sql = "SELECT id, username, '' AS password, role, created_at FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findById for user id: " + id, e);
        }
        return null;
    }

    /**
     * Retrieves all users having a specified role (e.g. 'STAFF').
     *
     * @param role user role name
     * @return List of matching User objects
     */
    public List<User> findUsersByRole(String role) {
        List<User> users = new ArrayList<>();
        if (role == null || !ALLOWED_ROLES.contains(role.trim().toUpperCase())) {
            LOGGER.warning("findUsersByRole rejected invalid role: " + role);
            return users;
        }

        String sql = "SELECT id, username, '' AS password, role, created_at FROM users WHERE role = ? ORDER BY username ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, role.trim().toUpperCase());

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findUsersByRole for role: " + role, e);
        }
        return users;
    }

    /**
     * Helper method to map a ResultSet row to a User object.
     */
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        return new User(
                rs.getInt("id"),
                rs.getString("username"),
                rs.getString("password"),
                rs.getString("role"),
                rs.getTimestamp("created_at")
        );
    }
}
