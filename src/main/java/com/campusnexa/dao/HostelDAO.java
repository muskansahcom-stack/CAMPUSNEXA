package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Hostel;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for student residential hostels.
 */
public class HostelDAO {

    private static final Logger LOGGER = Logger.getLogger(HostelDAO.class.getName());

    public boolean createHostel(Hostel hostel) {
        String sql = "INSERT INTO hostels (name, type, capacity) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, hostel.getName().trim());
            ps.setString(2, hostel.getType() != null ? hostel.getType().toUpperCase() : "COED");
            ps.setInt(3, hostel.getCapacity() > 0 ? hostel.getCapacity() : 100);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        hostel.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating hostel: " + hostel.getName(), e);
        }
        return false;
    }

    public Hostel getHostelById(int id) {
        String sql = "SELECT id, name, type, capacity, created_at FROM hostels WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapHostel(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching hostel by ID: " + id, e);
        }
        return null;
    }

    public List<Hostel> getAllHostels() {
        List<Hostel> list = new ArrayList<>();
        String sql = "SELECT id, name, type, capacity, created_at FROM hostels ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapHostel(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all hostels", e);
        }
        return list;
    }

    public boolean updateHostel(Hostel hostel) {
        String sql = "UPDATE hostels SET name = ?, type = ?, capacity = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, hostel.getName().trim());
            ps.setString(2, hostel.getType() != null ? hostel.getType().toUpperCase() : "COED");
            ps.setInt(3, hostel.getCapacity());
            ps.setInt(4, hostel.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating hostel ID: " + hostel.getId(), e);
        }
        return false;
    }

    public boolean deleteHostel(int id) {
        String sql = "DELETE FROM hostels WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting hostel ID: " + id, e);
        }
        return false;
    }

    public List<Hostel> searchHostels(String query) {
        List<Hostel> list = new ArrayList<>();
        if (!ValidationUtil.isNotEmpty(query)) {
            return getAllHostels();
        }
        String sql = "SELECT id, name, type, capacity, created_at FROM hostels " +
                     "WHERE LOWER(name) LIKE ? OR LOWER(type) LIKE ? ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + query.trim().toLowerCase() + "%";
            ps.setString(1, term);
            ps.setString(2, term);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapHostel(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching hostels with query: " + query, e);
        }
        return list;
    }

    private Hostel mapHostel(ResultSet rs) throws SQLException {
        Hostel h = new Hostel();
        h.setId(rs.getInt("id"));
        h.setName(rs.getString("name"));
        h.setType(rs.getString("type"));
        h.setCapacity(rs.getInt("capacity"));
        h.setCreatedAt(rs.getTimestamp("created_at"));
        return h;
    }
}
