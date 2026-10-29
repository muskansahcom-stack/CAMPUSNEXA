package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.Category;
import com.campusnexa.util.ValidationUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for complaint categories and default SLA policies.
 */
public class CategoryDAO {

    private static final Logger LOGGER = Logger.getLogger(CategoryDAO.class.getName());

    public boolean createCategory(Category category) {
        String sql = "INSERT INTO complaint_categories (code, name, icon, default_sla_hours, description) " +
                     "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, category.getCode().toUpperCase().trim());
            ps.setString(2, category.getName().trim());
            ps.setString(3, category.getIcon() != null ? category.getIcon() : "📌");
            ps.setInt(4, category.getDefaultSlaHours() > 0 ? category.getDefaultSlaHours() : 24);
            ps.setString(5, category.getDescription());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        category.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating category: " + category.getName(), e);
        }
        return false;
    }

    public Category getCategoryById(int id) {
        String sql = "SELECT id, code, name, icon, default_sla_hours, description, created_at FROM complaint_categories WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapCategory(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching category by ID: " + id, e);
        }
        return null;
    }

    public Category getCategoryByCode(String code) {
        String sql = "SELECT id, code, name, icon, default_sla_hours, description, created_at FROM complaint_categories WHERE code = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, code != null ? code.trim().toUpperCase() : "");
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapCategory(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching category by code: " + code, e);
        }
        return null;
    }

    public List<Category> getAllCategories() {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT id, code, name, icon, default_sla_hours, description, created_at FROM complaint_categories ORDER BY id ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapCategory(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all categories", e);
        }
        return list;
    }

    public boolean updateCategory(Category category) {
        String sql = "UPDATE complaint_categories SET code = ?, name = ?, icon = ?, default_sla_hours = ?, description = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, category.getCode().toUpperCase().trim());
            ps.setString(2, category.getName().trim());
            ps.setString(3, category.getIcon() != null ? category.getIcon() : "📌");
            ps.setInt(4, category.getDefaultSlaHours());
            ps.setString(5, category.getDescription());
            ps.setInt(6, category.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating category ID: " + category.getId(), e);
        }
        return false;
    }

    public boolean deleteCategory(int id) {
        String sql = "DELETE FROM complaint_categories WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting category ID: " + id, e);
        }
        return false;
    }

    public List<Category> searchCategories(String query) {
        List<Category> list = new ArrayList<>();
        if (!ValidationUtil.isNotEmpty(query)) {
            return getAllCategories();
        }
        String sql = "SELECT id, code, name, icon, default_sla_hours, description, created_at " +
                     "FROM complaint_categories WHERE LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(description) LIKE ? " +
                     "ORDER BY name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String term = "%" + query.trim().toLowerCase() + "%";
            ps.setString(1, term);
            ps.setString(2, term);
            ps.setString(3, term);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapCategory(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching categories with query: " + query, e);
        }
        return list;
    }

    private Category mapCategory(ResultSet rs) throws SQLException {
        Category c = new Category();
        c.setId(rs.getInt("id"));
        c.setCode(rs.getString("code"));
        c.setName(rs.getString("name"));
        c.setIcon(rs.getString("icon"));
        c.setDefaultSlaHours(rs.getInt("default_sla_hours"));
        c.setDescription(rs.getString("description"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        return c;
    }
}
