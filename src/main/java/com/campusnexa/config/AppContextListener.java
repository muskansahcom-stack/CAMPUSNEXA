package com.campusnexa.config;

import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
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
            ensureDatabaseInitialized();
            try {
                new com.campusnexa.dao.NotificationDAO().ensureSchema();
            } catch (Exception e) {
                LOGGER.warning("Could not pre-initialize notification schema: " + e.getMessage());
            }
        } else {
            LOGGER.warning("CampusNexa: Database connection FAILED. Ensure MySQL is running and credentials are valid.");
        }
        LOGGER.info("CampusNexa Web Application initialized successfully.");
        LOGGER.info("=================================================");
    }

    private void ensureDatabaseInitialized() {
        try (Connection conn = DBConnection.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            boolean hasUsers = false;
            try (ResultSet rs = meta.getTables(conn.getCatalog(), null, "users", null)) {
                if (rs.next()) {
                    hasUsers = true;
                }
            }
            if (!hasUsers) {
                try (ResultSet rs = meta.getTables(null, null, "users", null)) {
                    if (rs.next()) {
                        hasUsers = true;
                    }
                }
            }

            if (!hasUsers) {
                LOGGER.info("CampusNexa: Blank database detected! Bootstrapping institutional schema and seed data...");
                try (java.io.InputStream in = getClass().getClassLoader().getResourceAsStream("init_schema.sql")) {
                    if (in != null) {
                        byte[] bytes = in.readAllBytes();
                        String script = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                        executeSqlScript(conn, script);
                        LOGGER.info("CampusNexa: Database bootstrap completed successfully.");
                    } else {
                        LOGGER.warning("CampusNexa: 'init_schema.sql' not found on classpath.");
                    }
                }
            } else {
                LOGGER.info("CampusNexa: Database schema already verified.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "CampusNexa schema initialization notice: " + e.getMessage(), e);
        }
    }

    private void executeSqlScript(Connection conn, String script) {
        String[] statements = script.split(";\\s*(\\r?\\n|$)");
        try (java.sql.Statement stmt = conn.createStatement()) {
            for (String raw : statements) {
                String sql = raw.trim();
                if (sql.isEmpty()) continue;

                // Strip leading comment lines if any
                String[] lines = sql.split("\\r?\\n");
                StringBuilder clean = new StringBuilder();
                for (String l : lines) {
                    String tl = l.trim();
                    if (!tl.startsWith("--") && !tl.startsWith("/*") && !tl.startsWith("*")) {
                        clean.append(l).append("\n");
                    }
                }
                sql = clean.toString().trim();
                if (!sql.isEmpty()) {
                    try {
                        stmt.execute(sql);
                    } catch (SQLException ex) {
                        LOGGER.warning("Schema bootstrap statement notice: " + ex.getMessage());
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Failed to create statement for schema bootstrap", e);
        }
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
