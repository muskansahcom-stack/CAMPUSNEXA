package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for platform configuration and system settings.
 */
public class SystemSettingDAO {

    private static final Logger LOGGER = Logger.getLogger(SystemSettingDAO.class.getName());

    public List<Map<String, String>> getAllSettings() {
        List<Map<String, String>> list = new ArrayList<>();
        String sql = "SELECT setting_key, setting_value, description, updated_at FROM system_settings ORDER BY setting_key ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, String> row = new HashMap<>();
                row.put("key", rs.getString("setting_key"));
                row.put("value", rs.getString("setting_value"));
                row.put("description", rs.getString("description"));
                Timestamp ts = rs.getTimestamp("updated_at");
                row.put("updatedAt", ts != null ? ts.toString() : "");
                list.add(row);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching system settings", e);
        }
        return list;
    }

    public String getSetting(String key, String defaultValue) {
        String sql = "SELECT setting_value FROM system_settings WHERE setting_key = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, key);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("setting_value");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching setting: " + key, e);
        }
        return defaultValue;
    }

    public boolean updateSetting(String key, String value, String description) {
        String sql = "INSERT INTO system_settings (setting_key, setting_value, description, updated_at) " +
                     "VALUES (?, ?, ?, CURRENT_TIMESTAMP) " +
                     "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), " +
                     "description = COALESCE(VALUES(description), description), updated_at = CURRENT_TIMESTAMP";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, key.trim());
            ps.setString(2, value != null ? value.trim() : "");
            ps.setString(3, description != null ? description.trim() : "");

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating setting: " + key, e);
        }
        return false;
    }
}
