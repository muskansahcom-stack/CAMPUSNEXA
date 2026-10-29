package com.maintenance.config;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Reusable JDBC Connection Factory for the Campus Maintenance Management System.
 *
 * Configuration is loaded from classpath resource 'db.properties' and can be
 * overridden at runtime using environment variables:
 *   - DB_URL
 *   - DB_USER
 *   - DB_PASSWORD
 */
public final class DBConnection {

    private static final Logger LOGGER = Logger.getLogger(DBConnection.class.getName());

    private static final String DEFAULT_PROPERTIES_FILE = "db.properties";
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/maintenance_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";
    private static final String DEFAULT_DRIVER = "com.mysql.cj.jdbc.Driver";

    private static String jdbcUrl;
    private static String jdbcUser;
    private static String jdbcPassword;
    private static String jdbcDriver;

    static {
        loadConfiguration();
        try {
            Class.forName(jdbcDriver);
            LOGGER.info("MySQL JDBC Driver registered successfully: " + jdbcDriver);
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Failed to locate MySQL JDBC Driver: " + jdbcDriver, e);
            throw new ExceptionInInitializerError("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    private DBConnection() {
        // Prevent instantiation
    }

    /**
     * Loads database configuration from db.properties with fallback to defaults
     * and environment variable overrides.
     */
    private static void loadConfiguration() {
        Properties props = new Properties();
        try (InputStream in = DBConnection.class.getClassLoader().getResourceAsStream(DEFAULT_PROPERTIES_FILE)) {
            if (in != null) {
                props.load(in);
            } else {
                LOGGER.warning("'" + DEFAULT_PROPERTIES_FILE + "' not found on classpath, applying fallback defaults.");
            }
        } catch (IOException e) {
            LOGGER.log(Level.WARNING, "Error reading '" + DEFAULT_PROPERTIES_FILE + "', applying fallback defaults.", e);
        }

        // Base configuration from file or defaults
        jdbcUrl = props.getProperty("db.url", DEFAULT_URL);
        jdbcUser = props.getProperty("db.user", DEFAULT_USER);
        jdbcPassword = props.getProperty("db.password", DEFAULT_PASSWORD);
        jdbcDriver = props.getProperty("db.driver", DEFAULT_DRIVER);

        // Environment variables override properties file if defined
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.trim().isEmpty()) {
            jdbcUrl = envUrl.trim();
        }

        String envUser = System.getenv("DB_USER");
        if (envUser != null && !envUser.trim().isEmpty()) {
            jdbcUser = envUser.trim();
        }

        String envPassword = System.getenv("DB_PASSWORD");
        if (envPassword != null) {
            jdbcPassword = envPassword;
        }

        // System property overrides
        String sysUrl = System.getProperty("db.url");
        if (sysUrl != null && !sysUrl.trim().isEmpty()) {
            jdbcUrl = sysUrl.trim();
        }
        String sysUser = System.getProperty("db.user");
        if (sysUser != null && !sysUser.trim().isEmpty()) {
            jdbcUser = sysUser.trim();
        }
        String sysPassword = System.getProperty("db.password");
        if (sysPassword != null) {
            jdbcPassword = sysPassword;
        }
    }

    /**
     * Obtains a new JDBC Connection to MySQL.
     *
     * @return active java.sql.Connection
     * @throws SQLException if a database access error occurs
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(jdbcUrl, jdbcUser, jdbcPassword);
    }

    /**
     * Tests connectivity to the database.
     *
     * @return true if connection was established and valid; false otherwise
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed() && conn.isValid(2);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "JDBC connection test failed: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Safely closes one or more JDBC auto-closeable resources.
     *
     * @param closeables AutoCloseable resources (Connection, Statement, ResultSet)
     */
    public static void close(AutoCloseable... closeables) {
        for (AutoCloseable c : closeables) {
            if (c != null) {
                try {
                    c.close();
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to close JDBC resource", e);
                }
            }
        }
    }

    /**
     * Standalone main method to test JDBC connection from terminal/scripts.
     */
    public static void main(String[] args) {
        System.out.println("Testing JDBC connection to: " + jdbcUrl);
        System.out.println("Using user: " + jdbcUser);

        try (Connection conn = getConnection()) {
            if (conn != null && conn.isValid(2)) {
                System.out.println("SUCCESS: Connected to MySQL database successfully!");
                System.out.println("Database Product: " + conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion());
                System.out.println("Catalog / Database: " + conn.getCatalog());
            } else {
                System.err.println("FAILURE: Connection could not be validated.");
                System.exit(1);
            }
        } catch (SQLException e) {
            System.err.println("FAILURE: Could not connect to MySQL: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
