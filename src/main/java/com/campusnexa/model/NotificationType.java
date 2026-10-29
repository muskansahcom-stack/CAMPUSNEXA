package com.campusnexa.model;

/**
 * Supported Phase 19 Notification Types.
 */
public final class NotificationType {

    public static final String COMPLAINT_SUBMITTED = "COMPLAINT_SUBMITTED";
    public static final String COMPLAINT_ASSIGNED  = "COMPLAINT_ASSIGNED";
    public static final String STATUS_UPDATED      = "STATUS_UPDATED";
    public static final String COMPLAINT_RESOLVED   = "COMPLAINT_RESOLVED";
    public static final String COMPLAINT_REOPENED   = "COMPLAINT_REOPENED";
    public static final String COMPLAINT_ESCALATED  = "COMPLAINT_ESCALATED";
    public static final String ADMIN_MESSAGE       = "ADMIN_MESSAGE";
    public static final String AUTHORITY_MESSAGE   = "AUTHORITY_MESSAGE";
    public static final String PROTECTED_RESPONSE  = "PROTECTED_RESPONSE";
    public static final String SYSTEM_ALERT        = "SYSTEM_ALERT";

    private NotificationType() {
        // Constants class
    }

    public static boolean isValid(String type) {
        if (type == null) return false;
        String t = type.trim().toUpperCase();
        return t.equals(COMPLAINT_SUBMITTED) ||
               t.equals(COMPLAINT_ASSIGNED) ||
               t.equals(STATUS_UPDATED) ||
               t.equals(COMPLAINT_RESOLVED) ||
               t.equals(COMPLAINT_REOPENED) ||
               t.equals(COMPLAINT_ESCALATED) ||
               t.equals(ADMIN_MESSAGE) ||
               t.equals(AUTHORITY_MESSAGE) ||
               t.equals(PROTECTED_RESPONSE) ||
               t.equals(SYSTEM_ALERT);
    }
}
