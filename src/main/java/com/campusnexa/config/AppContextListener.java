package com.campusnexa.config;

import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Lifecycle listener for CampusNexa web application.
 * Manages clean startup diagnostics and deregisters JDBC drivers on shutdown.
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    private static final Logger LOGGER = Logger.getLogger(AppContextListener.class.getName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        LOGGER.info("=================================================");
        LOGGER.info("CampusNexa Web Application initializing...");
        LOGGER.info("Testing database connectivity...");
        boolean connected = DBConnection.testConnection();
        if (connected) {
            LOGGER.info("CampusNexa: Database connection SUCCESS.");
            try {
                new com.campusnexa.dao.NotificationDAO().ensureSchema();
            } catch (Exception e) {
                LOGGER.warning("Could not pre-initialize notification schema: " + e.getMessage());
            }
        } else {
            LOGGER.warning("CampusNexa: Database connection FAILED. Ensure MySQL is running on localhost:3306.");
        }
        LOGGER.info("CampusNexa Web Application initialized successfully.");
        LOGGER.info("=================================================");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        LOGGER.info("CampusNexa shutting down: cleaning JDBC resources...");

        // Deregister JDBC drivers registered by this webapp ClassLoader
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            Driver driver = drivers.nextElement();
            if (driver.getClass().getClassLoader() == cl) {
                try {
                    DriverManager.deregisterDriver(driver);
                    LOGGER.info("Deregistered JDBC driver: " + driver);
                } catch (SQLException e) {
                    LOGGER.log(Level.WARNING, "Error deregistering JDBC driver: " + driver, e);
                }
            }
        }

        // Shut down MySQL cleanup thread
        try {
            AbandonedConnectionCleanupThread.checkedShutdown();
            LOGGER.info("MySQL AbandonedConnectionCleanupThread shut down cleanly.");
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error shutting down AbandonedConnectionCleanupThread", e);
        }
    }
}
