package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.User;
import com.campusnexa.util.ValidationUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for User operations across all 5 roles.
 */
public class UserDAO {

    private static final Logger LOGGER = Logger.getLogger(UserDAO.class.getName());

    /**
     * Authenticates a user by username and password.
     */
    public User findByUsernameAndPassword(String username, String password) {
        if (!ValidationUtil.isNotEmpty(username) || !ValidationUtil.isNotEmpty(password)) {
            return null;
        }

        String sql = "SELECT id, username, password, role, full_name, email, phone, " +
                     "department, room_number, is_active, created_at, updated_at " +
                     "FROM users WHERE username = ? AND is_active = TRUE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String storedPassword = rs.getString("password");
                    String hashedInput = ValidationUtil.sha256(password);
                    if (hashedInput != null && (hashedInput.equalsIgnoreCase(storedPassword) || password.equals(storedPassword))) {
                        if (password.equals(storedPassword) && !storedPassword.equals(hashedInput)) {
                            upgradePasswordHash(rs.getInt("id"), hashedInput);
                        }
                        return mapResultSetToUser(rs);
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findByUsernameAndPassword for: " + username, e);
        }
        return null;
    }

    private void upgradePasswordHash(int userId, String hash) {
        String sql = "UPDATE users SET password = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, hash);
            ps.setInt(2, userId);
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Could not upgrade password hash for user ID: " + userId, e);
        }
    }

    /**
     * Finds a user by unique ID.
     */
    public User findById(int id) {
        if (id <= 0) return null;

        String sql = "SELECT id, username, '' AS password, role, full_name, email, phone, " +
                     "department, room_number, is_active, created_at, updated_at " +
                     "FROM users WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findById for: " + id, e);
        }
        return null;
    }

    /**
     * Finds a user by username handle.
     */
    public User findByUsername(String username) {
        if (!ValidationUtil.isNotEmpty(username)) return null;

        String sql = "SELECT id, username, password, role, full_name, email, phone, " +
                     "department, room_number, is_active, created_at, updated_at " +
                     "FROM users WHERE username = ?";

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
     * Retrieves all active users belonging to a specific role.
     */
    public List<User> findUsersByRole(String role) {
        List<User> list = new ArrayList<>();
        if (!ValidationUtil.isValidRole(role)) return list;

        String sql = "SELECT id, username, '' AS password, role, full_name, email, phone, " +
                     "department, room_number, is_active, created_at, updated_at " +
                     "FROM users WHERE role = ? AND is_active = TRUE ORDER BY full_name ASC, username ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, role.trim().toUpperCase());

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findUsersByRole for: " + role, e);
        }
        return list;
    }

    /**
     * Retrieves all users in the system (Admin only).
     */
    public List<User> findAllUsers() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT id, username, '' AS password, role, full_name, email, phone, " +
                     "department, room_number, is_active, created_at, updated_at " +
                     "FROM users ORDER BY id ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in findAllUsers", e);
        }
        return list;
    }

    /**
     * Creates a new user record.
     */
    public boolean createUser(User user) {
        if (user == null || !ValidationUtil.isNotEmpty(user.getUsername()) || !ValidationUtil.isNotEmpty(user.getPassword())) {
            return false;
        }

        String sql = "INSERT INTO users (username, password, role, full_name, email, phone, department, room_number, is_active) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, user.getUsername().trim());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT");
            ps.setString(4, user.getFullName());
            ps.setString(5, user.getEmail());
            ps.setString(6, user.getPhone());
            ps.setString(7, user.getDepartment());
            ps.setString(8, user.getRoomNumber());
            ps.setBoolean(9, user.isActive());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        user.setId(keys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in createUser for: " + user.getUsername(), e);
        }
        return false;
    }

    /**
     * Ensures all 5 default role accounts exist in MySQL.
     */
    public void ensureDemoUsersExist() {
        String sql = "INSERT INTO users (id, username, password, role, full_name, email, phone, is_active) VALUES " +
                     "(1, 'admin', 'admin123', 'ADMIN', 'Institutional System Administrator', 'admin@campusnexa.edu', '+91 98765 00001', TRUE), " +
                     "(2, 'technician1', 'tech123', 'STAFF', 'Rajesh Sharma (Lead Electrician)', 'technician1@campusnexa.edu', '+91 98765 00002', TRUE), " +
                     "(3, 'student1', 'student123', 'STUDENT', 'Muskan Sah', 'muskan.sah@campusnexa.edu', '+91 98765 00003', TRUE), " +
                     "(4, 'student2', 'student123', 'STUDENT', 'Diya Sen (Electronics Engineering)', 'student2@campusnexa.edu', '+91 98765 00004', TRUE), " +
                     "(5, 'warden1', 'warden123', 'WARDEN', 'Dr. Suresh Varma (Chief Hostel Warden)', 'warden1@campusnexa.edu', '+91 98765 00005', TRUE), " +
                     "(6, 'coe_admin', 'coe123', 'HIGHER_AUTHORITY', 'Prof. Meenakshi Sundaram (COE / Institutional Authority)', 'coe@campusnexa.edu', '+91 98765 00006', TRUE) " +
                     "ON DUPLICATE KEY UPDATE role = VALUES(role), password = VALUES(password), full_name = VALUES(full_name), is_active = TRUE";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "ensureDemoUsersExist exception: " + e.getMessage());
        }
    }

    /**
     * Updates profile details of an existing user (Admin).
     */
    public boolean updateUser(User user) {
        if (user == null || user.getId() <= 0) return false;
        String sql = "UPDATE users SET full_name = ?, email = ?, phone = ?, department = ?, room_number = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPhone());
            ps.setString(4, user.getDepartment());
            ps.setString(5, user.getRoomNumber());
            ps.setInt(6, user.getId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in updateUser for ID: " + user.getId(), e);
        }
        return false;
    }

    /**
     * Activates or deactivates a user account (Admin).
     */
    public boolean toggleUserActive(int userId, boolean isActive) {
        if (userId <= 0) return false;
        String sql = "UPDATE users SET is_active = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, isActive);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error in toggleUserActive for ID: " + userId, e);
        }
        return false;
    }

    /**
     * Assigns a role to a user, updating both users table and user_roles table (Admin).
     */
    public boolean updateUserRole(int userId, String newRole) {
        if (userId <= 0 || !ValidationUtil.isValidRole(newRole)) return false;
        String normalizedRole = newRole.trim().toUpperCase();

        String sqlUser = "UPDATE users SET role = ? WHERE id = ?";
        String sqlRoleLink = "INSERT INTO user_roles (user_id, role_id) " +
                             "SELECT ?, id FROM roles WHERE name = ? " +
                             "ON DUPLICATE KEY UPDATE role_id = (SELECT id FROM roles WHERE name = ?)";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement psUser = conn.prepareStatement(sqlUser);
                 PreparedStatement psRole = conn.prepareStatement(sqlRoleLink)) {

                psUser.setString(1, normalizedRole);
                psUser.setInt(2, userId);
                psUser.executeUpdate();

                psRole.setInt(1, userId);
                psRole.setString(2, normalizedRole);
                psRole.setString(3, normalizedRole);
                psRole.executeUpdate();

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                LOGGER.log(Level.SEVERE, "Error in transaction updateUserRole for ID: " + userId, e);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Connection error in updateUserRole for ID: " + userId, e);
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
        return false;
    }

    /**
     * Deletes a user account (Admin).
     */
    public boolean deleteUser(int userId) {
        if (userId <= 0) return false;
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error deleting user ID: " + userId, e);
        }
        return false;
    }

    /**
     * Strict backend verification of explicit permissions.
     * Note: VIEW_PROTECTED_IDENTITY must NEVER be granted via role inheritance.
     */
    public boolean hasPermission(int userId, String permissionCode) {
        if (userId <= 0 || permissionCode == null || permissionCode.trim().isEmpty()) {
            return false;
        }
        String code = permissionCode.trim().toUpperCase();

        // 1. Check user_permissions table (explicit individual user grant)
        String userPermSql = "SELECT 1 FROM user_permissions up " +
                             "JOIN permissions p ON up.permission_id = p.id " +
                             "WHERE up.user_id = ? AND p.code = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(userPermSql)) {
            ps.setInt(1, userId);
            ps.setString(2, code);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return true;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking user_permissions for user: " + userId + ", perm: " + code, e);
        }

        // VIEW_PROTECTED_IDENTITY is an explicit Whistleblower protection permission
        // It CANNOT be inherited from general role permissions
        if ("VIEW_PROTECTED_IDENTITY".equals(code)) {
            return false;
        }

        // 2. Check role_permissions table (inherited via assigned system role)
        String rolePermSql = "SELECT 1 FROM role_permissions rp " +
                             "JOIN permissions p ON rp.permission_id = p.id " +
                             "JOIN roles r ON rp.role_id = r.id " +
                             "JOIN users u ON (u.role = r.name OR u.id IN (SELECT ur.user_id FROM user_roles ur WHERE ur.role_id = r.id)) " +
                             "WHERE u.id = ? AND p.code = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(rolePermSql)) {
            ps.setInt(1, userId);
            ps.setString(2, code);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return true;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking role_permissions for user: " + userId + ", perm: " + code, e);
        }

        return false;
    }

    /**
     * Retrieves all effective permissions for a user.
     */
    public List<String> getUserPermissions(int userId) {
        List<String> list = new ArrayList<>();
        if (userId <= 0) return list;

        String sql = "SELECT DISTINCT p.code FROM permissions p " +
                     "WHERE p.id IN (" +
                     "    SELECT up.permission_id FROM user_permissions up WHERE up.user_id = ?" +
                     "    UNION " +
                     "    SELECT rp.permission_id FROM role_permissions rp " +
                     "    JOIN roles r ON rp.role_id = r.id " +
                     "    JOIN users u ON (u.role = r.name OR u.id IN (SELECT ur.user_id FROM user_roles ur WHERE ur.role_id = r.id)) " +
                     "    WHERE u.id = ? AND p.code != 'VIEW_PROTECTED_IDENTITY'" +
                     ") ORDER BY p.code ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(rs.getString("code"));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error retrieving user permissions for ID: " + userId, e);
        }
        return list;
    }

    /**
     * Retrieves all registered permissions.
     */
    public List<Map<String, Object>> getAllPermissions() {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT id, code, name, description, category, created_at FROM permissions ORDER BY category ASC, name ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("id"));
                map.put("code", rs.getString("code"));
                map.put("name", rs.getString("name"));
                map.put("description", rs.getString("description"));
                map.put("category", rs.getString("category"));
                list.add(map);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all permissions", e);
        }
        return list;
    }

    /**
     * Explicitly grants a permission to a user account.
     */
    public boolean grantUserPermission(int userId, String permCode, Integer grantedBy) {
        if (userId <= 0 || permCode == null || permCode.trim().isEmpty()) return false;
        String sql = "INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at) " +
                     "SELECT ?, id, ?, CURRENT_TIMESTAMP FROM permissions WHERE code = ? " +
                     "ON DUPLICATE KEY UPDATE granted_by = VALUES(granted_by), granted_at = CURRENT_TIMESTAMP";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            if (grantedBy != null && grantedBy > 0) {
                ps.setInt(2, grantedBy);
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setString(3, permCode.trim().toUpperCase());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error granting permission " + permCode + " to user " + userId, e);
        }
        return false;
    }

    /**
     * Revokes an explicit permission from a user account.
     */
    public boolean revokeUserPermission(int userId, String permCode) {
        if (userId <= 0 || permCode == null || permCode.trim().isEmpty()) return false;
        String sql = "DELETE up FROM user_permissions up " +
                     "JOIN permissions p ON up.permission_id = p.id " +
                     "WHERE up.user_id = ? AND p.code = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, permCode.trim().toUpperCase());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error revoking permission " + permCode + " from user " + userId, e);
        }
        return false;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        try {
            user.setPassword(rs.getString("password"));
        } catch (SQLException ignored) {}
        user.setRole(rs.getString("role"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setPhone(rs.getString("phone"));
        user.setDepartment(rs.getString("department"));
        user.setRoomNumber(rs.getString("room_number"));
        user.setActive(rs.getBoolean("is_active"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        try {
            user.setUpdatedAt(rs.getTimestamp("updated_at"));
        } catch (SQLException ignored) {}
        return user;
    }
}
