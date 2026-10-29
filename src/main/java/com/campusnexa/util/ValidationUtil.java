package com.campusnexa.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Year;
import java.util.Set;

/**
 * Common validation, formatting, and security utilities for CampusNexa.
 */
public final class ValidationUtil {

    private ValidationUtil() {
        // Utility class
    }

    public static final Set<String> ALLOWED_ROLES = Set.of(
            "STUDENT",
            "STAFF",
            "MAINTENANCE_STAFF",
            "WARDEN",
            "DEPUTY_WARDEN",
            "HIGHER_AUTHORITY",
            "ADMIN"
    );

    public static final Set<String> ALLOWED_PRIORITIES = Set.of(
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
    );

    public static final Set<String> ALLOWED_STATUSES = Set.of(
            "SUBMITTED",
            "UNDER_REVIEW",
            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED",
            "REOPENED",
            "ESCALATED",
            "REJECTED"
    );

    /**
     * Generates a unique complaint identifier: CNX-YYYY-000001
     *
     * @param sequence numeric ID from database
     * @return formatted complaint number
     */
    public static String generateComplaintNumber(int sequence) {
        int year = Year.now().getValue();
        return String.format("CNX-%d-%06d", year, sequence);
    }

    /**
     * Generates a unique escalation identifier: CNX-ESC-YYYY-000001
     *
     * @param sequence numeric ID from database
     * @return formatted escalation number
     */
    public static String generateEscalationNumber(int sequence) {
        int year = Year.now().getValue();
        return String.format("CNX-ESC-%d-%06d", year, sequence);
    }

    /**
     * Checks if a string is non-null and non-empty after trimming.
     */
    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * Validates whether a role is one of the supported 5 roles.
     */
    public static boolean isValidRole(String role) {
        return role != null && ALLOWED_ROLES.contains(role.trim().toUpperCase());
    }

    /**
     * Validates whether a priority is one of the supported priority levels.
     */
    public static boolean isValidPriority(String priority) {
        return priority != null && ALLOWED_PRIORITIES.contains(priority.trim().toUpperCase());
    }

    /**
     * Validates whether a status is one of the supported complaint statuses.
     */
    public static boolean isValidStatus(String status) {
        return status != null && ALLOWED_STATUSES.contains(status.trim().toUpperCase());
    }

    /**
     * Escapes characters in a string for safe inclusion in JSON text.
     */
    public static String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    /**
     * Computes a SHA-256 hash of a string.
     */
    public static String sha256(String input) {
        if (input == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
