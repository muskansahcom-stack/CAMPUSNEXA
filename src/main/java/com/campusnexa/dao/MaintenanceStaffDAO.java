package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.MaintenanceStaff;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for maintenance technician profiles, specialties, and workloads.
 */
public class MaintenanceStaffDAO {

    private static final Logger LOGGER = Logger.getLogger(MaintenanceStaffDAO.class.getName());

    public boolean createStaff(MaintenanceStaff staff) {
        String sql = "INSERT INTO maintenance_staff (user_id, specialty, is_available, active_tasks) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, staff.getUserId());
            ps.setString(2, staff.getSpecialty() != null ? staff.getSpecialty() : "General Repairs");
            ps.setBoolean(3, staff.isAvailable());
            ps.setInt(4, staff.getActiveTasks());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        staff.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error registering maintenance staff for user: " + staff.getUserId(), e);
        }
        return false;
    }

    public MaintenanceStaff getStaffById(int id) {
        String sql = getBaseQuery() + " WHERE ms.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapStaff(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching staff by ID: " + id, e);
        }
        return null;
    }

    public MaintenanceStaff getStaffByUserId(int userId) {
        String sql = getBaseQuery() + " WHERE ms.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapStaff(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching staff by user ID: " + userId, e);
        }
        return null;
    }

    public List<MaintenanceStaff> getAllStaff() {
        List<MaintenanceStaff> list = new ArrayList<>();
        String sql = getBaseQuery() + " ORDER BY u.full_name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapStaff(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all maintenance staff", e);
        }
        return list;
    }

    public List<MaintenanceStaff> getAvailableStaffBySpecialty(String specialty) {
        List<MaintenanceStaff> list = new ArrayList<>();
        String sql = getBaseQuery() + " WHERE ms.is_available = TRUE AND (LOWER(ms.specialty) LIKE ? OR LOWER(ms.specialty) LIKE '%general%') " +
                     "ORDER BY ms.active_tasks ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + (specialty != null ? specialty.toLowerCase() : "") + "%";
            ps.setString(1, term);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapStaff(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching available staff by specialty: " + specialty, e);
        }
        return list;
    }

    public boolean updateStaff(MaintenanceStaff staff) {
        String sql = "UPDATE maintenance_staff SET specialty = ?, is_available = ?, active_tasks = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, staff.getSpecialty());
            ps.setBoolean(2, staff.isAvailable());
            ps.setInt(3, staff.getActiveTasks());
            ps.setInt(4, staff.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating staff ID: " + staff.getId(), e);
        }
        return false;
    }

    public boolean updateAvailability(int staffId, boolean isAvailable) {
        String sql = "UPDATE maintenance_staff SET is_available = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setBoolean(1, isAvailable);
            ps.setInt(2, staffId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating availability for staff ID: " + staffId, e);
        }
        return false;
    }

    public boolean incrementActiveTasks(int userId) {
        String sql = "UPDATE maintenance_staff SET active_tasks = active_tasks + 1 WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error incrementing tasks for staff user: " + userId, e);
        }
        return false;
    }

    public boolean decrementActiveTasks(int userId) {
        String sql = "UPDATE maintenance_staff SET active_tasks = GREATEST(0, active_tasks - 1) WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error decrementing tasks for staff user: " + userId, e);
        }
        return false;
    }

    public boolean deleteStaff(int id) {
        String sql = "DELETE FROM maintenance_staff WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting staff record ID: " + id, e);
        }
        return false;
    }

    private String getBaseQuery() {
        return "SELECT ms.id, ms.user_id, u.username, u.full_name, u.email, ms.specialty, " +
               "ms.is_available, ms.active_tasks, ms.created_at " +
               "FROM maintenance_staff ms " +
               "JOIN users u ON ms.user_id = u.id";
    }

    private MaintenanceStaff mapStaff(ResultSet rs) throws SQLException {
        MaintenanceStaff s = new MaintenanceStaff();
        s.setId(rs.getInt("id"));
        s.setUserId(rs.getInt("user_id"));
        s.setUsername(rs.getString("username"));
        s.setFullName(rs.getString("full_name"));
        s.setEmail(rs.getString("email"));
        s.setSpecialty(rs.getString("specialty"));
        s.setAvailable(rs.getBoolean("is_available"));
        s.setActiveTasks(rs.getInt("active_tasks"));
        s.setCreatedAt(rs.getTimestamp("created_at"));
        return s;
    }
}
