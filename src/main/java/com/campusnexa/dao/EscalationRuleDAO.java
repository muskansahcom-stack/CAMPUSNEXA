package com.campusnexa.dao;

import com.campusnexa.config.DBConnection;
import com.campusnexa.model.EscalationRule;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Escalation & Response Monitoring Rules.
 * Manages institutional SLA benchmarks, administrator configurations, and real-time response/resolution metrics.
 */
public class EscalationRuleDAO {

    private static final Logger LOGGER = Logger.getLogger(EscalationRuleDAO.class.getName());
    public static final String POLICY_DISCLAIMER =
            "Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.";

    /**
     * Retrieve all active escalation rules ordered by id.
     */
    public List<EscalationRule> getAllRules() {
        List<EscalationRule> list = new ArrayList<>();
        String sql = "SELECT id, category_name, rule_type, expected_response_hours, expected_resolution_hours, " +
                "priority_level, description, policy_disclaimer, is_active, created_at, updated_at " +
                "FROM escalation_rules ORDER BY id ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapRule(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalation rules", e);
        }
        return list;
    }

    /**
     * Retrieve a specific rule by ID.
     */
    public EscalationRule getRuleById(int id) {
        String sql = "SELECT id, category_name, rule_type, expected_response_hours, expected_resolution_hours, " +
                "priority_level, description, policy_disclaimer, is_active, created_at, updated_at " +
                "FROM escalation_rules WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRule(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching escalation rule by id: " + id, e);
        }
        return null;
    }

    /**
     * Retrieve rule by exact category name.
     */
    public EscalationRule getRuleByCategory(String categoryName) {
        if (categoryName == null) return null;
        String sql = "SELECT id, category_name, rule_type, expected_response_hours, expected_resolution_hours, " +
                "priority_level, description, policy_disclaimer, is_active, created_at, updated_at " +
                "FROM escalation_rules WHERE category_name = ? LIMIT 1";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, categoryName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRule(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching rule for category: " + categoryName, e);
        }
        return null;
    }

    /**
     * Find best matching escalation rule for a complaint based on priority and category.
     * Priority CRITICAL takes precedence -> Critical rule.
     * Otherwise matches category name (Mess/Food, Cleaning, Electrical, Water).
     * Falls back to General rule if no exact category match found.
     */
    public EscalationRule getMatchingRule(String categoryName, String priority) {
        List<EscalationRule> allRules = getAllRules();
        if (allRules.isEmpty()) {
            return defaultFallbackRule();
        }

        if (priority != null && priority.equalsIgnoreCase("CRITICAL")) {
            for (EscalationRule r : allRules) {
                if ("CRITICAL".equalsIgnoreCase(r.getPriorityLevel()) || "Critical".equalsIgnoreCase(r.getCategoryName())) {
                    return r;
                }
            }
        }

        if (categoryName != null) {
            String normCat = categoryName.trim().toLowerCase();
            for (EscalationRule r : allRules) {
                String rName = r.getCategoryName().toLowerCase();
                if (rName.equals(normCat) || normCat.contains(rName) || rName.contains(normCat)) {
                    return r;
                }
            }
        }

        // Fallback to General
        for (EscalationRule r : allRules) {
            if ("General".equalsIgnoreCase(r.getCategoryName())) {
                return r;
            }
        }

        return allRules.get(0);
    }

    private static volatile List<EscalationRule> cachedRules = null;
    private static final Object CACHE_LOCK = new Object();

    public static void invalidateCache() {
        synchronized (CACHE_LOCK) {
            cachedRules = null;
        }
    }

    /**
     * Fast benchmark lookup returning int[] { expectedResponseHours, expectedResolutionHours }
     */
    public static int[] getExpectedHoursBenchmark(String categoryName, String priority) {
        List<EscalationRule> rules = cachedRules;
        if (rules == null) {
            synchronized (CACHE_LOCK) {
                rules = cachedRules;
                if (rules == null) {
                    rules = new EscalationRuleDAO().getAllRules();
                    cachedRules = rules;
                }
            }
        }

        if (rules != null && !rules.isEmpty()) {
            if (priority != null && priority.equalsIgnoreCase("CRITICAL")) {
                for (EscalationRule r : rules) {
                    if ("CRITICAL".equalsIgnoreCase(r.getPriorityLevel()) || "Critical".equalsIgnoreCase(r.getCategoryName())) {
                        return new int[]{r.getExpectedResponseHours(), r.getExpectedResolutionHours()};
                    }
                }
            }

            if (categoryName != null) {
                String normCat = categoryName.trim().toLowerCase();
                for (EscalationRule r : rules) {
                    String rName = r.getCategoryName().toLowerCase();
                    if (rName.equals(normCat) || normCat.contains(rName) || rName.contains(normCat)) {
                        return new int[]{r.getExpectedResponseHours(), r.getExpectedResolutionHours()};
                    }
                }
            }

            for (EscalationRule r : rules) {
                if ("General".equalsIgnoreCase(r.getCategoryName())) {
                    return new int[]{r.getExpectedResponseHours(), r.getExpectedResolutionHours()};
                }
            }
        }

        // Hard defaults if DB empty
        if (priority != null && priority.equalsIgnoreCase("CRITICAL")) return new int[]{1, 4};
        if (categoryName != null && (categoryName.contains("Mess") || categoryName.contains("Food"))) return new int[]{2, 6};
        if (categoryName != null && categoryName.contains("Clean")) return new int[]{2, 8};
        if (categoryName != null && categoryName.contains("Elect")) return new int[]{3, 12};
        if (categoryName != null && categoryName.contains("Water")) return new int[]{3, 12};
        return new int[]{6, 24};
    }

    /**
     * Administrator updates expected response and resolution benchmark hours for a rule.
     */
    public boolean updateRule(int id, int expectedResponseHours, int expectedResolutionHours, String description) {
        String sql = "UPDATE escalation_rules SET expected_response_hours = ?, expected_resolution_hours = ?, " +
                "description = COALESCE(?, description), updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, expectedResponseHours);
            ps.setInt(2, expectedResolutionHours);
            ps.setString(3, description);
            ps.setInt(4, id);

            boolean ok = ps.executeUpdate() > 0;
            if (ok) {
                invalidateCache();
            }
            return ok;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating escalation rule ID: " + id, e);
            return false;
        }
    }

    /**
     * Compute real institutional response and resolution monitoring statistics directly from actual database timestamps.
     * NO fake or hardcoded values are generated.
     */
    public Map<String, Object> getResponseMonitoringStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("policyDisclaimer", POLICY_DISCLAIMER);
        stats.put("avgResponseTimeHours", 0.0);
        stats.put("avgResolutionTimeHours", 0.0);
        stats.put("avgResponseTimeFormatted", "N/A");
        stats.put("avgResolutionTimeFormatted", "N/A");
        stats.put("totalComplaints", 0);
        stats.put("totalOverdue", 0);
        stats.put("responseOverdue", 0);
        stats.put("resolutionOverdue", 0);
        stats.put("activeRulesCount", 0);

        String sqlStats = "SELECT " +
                "COUNT(*) AS total_complaints, " +
                "ROUND(AVG(CASE WHEN assigned_at IS NOT NULL OR work_started_at IS NOT NULL " +
                "     THEN TIMESTAMPDIFF(SECOND, created_at, COALESCE(assigned_at, work_started_at)) ELSE NULL END), 0) AS avg_response_seconds, " +
                "ROUND(AVG(CASE WHEN resolved_at IS NOT NULL " +
                "     THEN TIMESTAMPDIFF(SECOND, created_at, resolved_at) ELSE NULL END), 0) AS avg_resolution_seconds " +
                "FROM complaints";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sqlStats)) {

            if (rs.next()) {
                int totalComplaints = rs.getInt("total_complaints");
                long avgResponseSeconds = rs.getLong("avg_response_seconds");
                long avgResolutionSeconds = rs.getLong("avg_resolution_seconds");

                stats.put("totalComplaints", totalComplaints);

                if (avgResponseSeconds > 0) {
                    double respHours = Math.round((avgResponseSeconds / 3600.0) * 10.0) / 10.0;
                    stats.put("avgResponseTimeHours", respHours);
                    stats.put("avgResponseTimeFormatted", formatDuration(avgResponseSeconds));
                } else {
                    stats.put("avgResponseTimeFormatted", "0h 0m");
                }

                if (avgResolutionSeconds > 0) {
                    double resolHours = Math.round((avgResolutionSeconds / 3600.0) * 10.0) / 10.0;
                    stats.put("avgResolutionTimeHours", resolHours);
                    stats.put("avgResolutionTimeFormatted", formatDuration(avgResolutionSeconds));
                } else {
                    stats.put("avgResolutionTimeFormatted", "0h 0m");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error calculating response monitoring stats", e);
        }

        // Active rules count
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS c FROM escalation_rules WHERE is_active = 1")) {
            if (rs.next()) {
                stats.put("activeRulesCount", rs.getInt("c"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting escalation rules", e);
        }

        // Count real overdue complaints by evaluating complaints against matching rules
        String sqlOverdue = "SELECT " +
                "COUNT(*) AS total_overdue, " +
                "SUM(CASE WHEN (c.assigned_at IS NULL AND c.work_started_at IS NULL AND c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') " +
                "    AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) > COALESCE(er.expected_response_hours, 6)) THEN 1 ELSE 0 END) AS resp_overdue, " +
                "SUM(CASE WHEN (c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') " +
                "    AND (c.is_overdue = 1 OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                "         OR TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) > COALESCE(er.expected_resolution_hours, 24))) THEN 1 ELSE 0 END) AS resol_overdue " +
                "FROM complaints c " +
                "LEFT JOIN complaint_categories cat ON c.category_id = cat.id " +
                "LEFT JOIN escalation_rules er ON (" +
                "    (c.priority = 'CRITICAL' AND er.priority_level = 'CRITICAL') OR " +
                "    (c.priority != 'CRITICAL' AND (er.category_name = cat.name OR (cat.name LIKE '%Food%' AND er.category_name = 'Mess/Food')))" +
                ") " +
                "WHERE (c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')) " +
                "  AND (" +
                "       c.is_overdue = 1 " +
                "       OR (c.sla_deadline IS NOT NULL AND c.sla_deadline < CURRENT_TIMESTAMP) " +
                "       OR (c.assigned_at IS NULL AND c.work_started_at IS NULL AND TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) > COALESCE(er.expected_response_hours, 6)) " +
                "       OR TIMESTAMPDIFF(HOUR, c.created_at, CURRENT_TIMESTAMP) > COALESCE(er.expected_resolution_hours, 24)" +
                "  )";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sqlOverdue)) {
            if (rs.next()) {
                int totalOverdue = rs.getInt("total_overdue");
                int respOverdue = rs.getInt("resp_overdue");
                int resolOverdue = rs.getInt("resol_overdue");

                stats.put("totalOverdue", totalOverdue);
                stats.put("responseOverdue", respOverdue);
                stats.put("resolutionOverdue", resolOverdue);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error calculating overdue counts", e);
        }

        return stats;
    }

    /**
     * Formats duration in seconds to readable format e.g. "2h 15m" or "1d 4h".
     */
    public static String formatDuration(long seconds) {
        if (seconds < 0) seconds = 0;
        long days = seconds / 86400;
        long hours = (seconds % 86400) / 3600;
        long minutes = (seconds % 3600) / 60;

        if (days > 0) {
            return String.format("%dd %dh", days, hours);
        } else if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", Math.max(1, minutes));
        }
    }

    private EscalationRule mapRule(ResultSet rs) throws SQLException {
        EscalationRule r = new EscalationRule();
        r.setId(rs.getInt("id"));
        r.setCategoryName(rs.getString("category_name"));
        r.setRuleType(rs.getString("rule_type"));
        r.setExpectedResponseHours(rs.getInt("expected_response_hours"));
        r.setExpectedResolutionHours(rs.getInt("expected_resolution_hours"));
        r.setPriorityLevel(rs.getString("priority_level"));
        r.setDescription(rs.getString("description"));
        r.setPolicyDisclaimer(rs.getString("policy_disclaimer"));
        r.setActive(rs.getBoolean("is_active"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        r.setUpdatedAt(rs.getTimestamp("updated_at"));
        return r;
    }

    private EscalationRule defaultFallbackRule() {
        EscalationRule r = new EscalationRule();
        r.setId(6);
        r.setCategoryName("General");
        r.setRuleType("CATEGORY");
        r.setExpectedResponseHours(6);
        r.setExpectedResolutionHours(24);
        r.setDescription("General maintenance SLA benchmark");
        r.setPolicyDisclaimer(POLICY_DISCLAIMER);
        r.setActive(true);
        return r;
    }
}
