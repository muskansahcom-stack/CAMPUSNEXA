package com.campusnexa.service;

import com.campusnexa.dao.NotificationDAO;
import com.campusnexa.dao.UserDAO;

import java.util.List;
import java.util.logging.Logger;

/**
 * Service Layer coordinating Administrator Operations and System Broadcast Alerts.
 */
public class AdminService {

    private static final Logger LOGGER = Logger.getLogger(AdminService.class.getName());
    private final UserDAO userDAO;
    private final NotificationService notificationService;

    public AdminService() {
        this(new UserDAO(), new NotificationService());
    }

    public AdminService(UserDAO userDAO, NotificationService notificationService) {
        this.userDAO = userDAO;
        this.notificationService = notificationService;
    }

    /**
     * Broadcasts an institutional system alert across campus users.
     */
    public int broadcastSystemAlert(String title, String message, String priority, List<String> targetRoles) {
        return notificationService.broadcastSystemAlert(title, message, priority, targetRoles);
    }

    public UserDAO getUserDAO() {
        return userDAO;
    }

    public NotificationService getNotificationService() {
        return notificationService;
    }
}
