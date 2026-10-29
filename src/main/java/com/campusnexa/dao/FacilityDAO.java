package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Facility;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for campus academic and administrative facilities.
 */
public class FacilityDAO {

    private static final Logger LOGGER = Logger.getLogger(FacilityDAO.class.getName());

    public boolean createFacility(Facility facility) {
        String sql = "INSERT INTO facilities (name, location_details, in_charge_name) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, facility.getName().trim());
            ps.setString(2, facility.getLocationDetails() != null ? facility.getLocationDetails().trim() : "");
            ps.setString(3, facility.getInChargeName() != null ? facility.getInChargeName().trim() : "");

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        facility.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating facility: " + facility.getName(), e);
        }
        return false;
    }

    public Facility getFacilityById(int id) {
        String sql = "SELECT id, name, location_details, in_charge_name, created_at FROM facilities WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapFacility(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching facility by ID: " + id, e);
        }
        return null;
    }

    public List<Facility> getAllFacilities() {
        List<Facility> list = new ArrayList<>();
        String sql = "SELECT id, name, location_details, in_charge_name, created_at FROM facilities ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapFacility(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all facilities", e);
        }
        return list;
    }

    public boolean updateFacility(Facility facility) {
        String sql = "UPDATE facilities SET name = ?, location_details = ?, in_charge_name = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, facility.getName().trim());
            ps.setString(2, facility.getLocationDetails());
            ps.setString(3, facility.getInChargeName());
            ps.setInt(4, facility.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating facility ID: " + facility.getId(), e);
        }
        return false;
    }

    public boolean deleteFacility(int id) {
        String sql = "DELETE FROM facilities WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting facility ID: " + id, e);
        }
        return false;
    }

    public List<Facility> searchFacilities(String query) {
        List<Facility> list = new ArrayList<>();
        if (!ValidationUtil.isNotEmpty(query)) {
            return getAllFacilities();
        }
        String sql = "SELECT id, name, location_details, in_charge_name, created_at " +
                     "FROM facilities WHERE LOWER(name) LIKE ? OR LOWER(location_details) LIKE ? OR LOWER(in_charge_name) LIKE ? " +
                     "ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + query.trim().toLowerCase() + "%";
            ps.setString(1, term);
            ps.setString(2, term);
            ps.setString(3, term);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapFacility(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching facilities with query: " + query, e);
        }
        return list;
    }

    private Facility mapFacility(ResultSet rs) throws SQLException {
        Facility f = new Facility();
        f.setId(rs.getInt("id"));
        f.setName(rs.getString("name"));
        f.setLocationDetails(rs.getString("location_details"));
        f.setInChargeName(rs.getString("in_charge_name"));
        f.setCreatedAt(rs.getTimestamp("created_at"));
        return f;
    }
}
