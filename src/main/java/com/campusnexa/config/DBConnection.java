package com.campusnexa.config;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Reusable JDBC Connection Factory for CampusNexa.
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
            LOGGER.info("CampusNexa: MySQL JDBC Driver registered successfully: " + jdbcDriver);
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Failed to locate MySQL JDBC Driver: " + jdbcDriver, e);
            throw new ExceptionInInitializerError("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    private DBConnection() {
        // Utility class: prevent instantiation
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

        // 1. URL resolution: Check DB_URL -> MYSQL_URL -> Railway MYSQLHOST/PORT/DATABASE
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.trim().isEmpty()) {
            jdbcUrl = envUrl.trim();
        } else {
            String mysqlUrl = System.getenv("MYSQL_URL");
            if (mysqlUrl != null && !mysqlUrl.trim().isEmpty()) {
                try {
                    String cleanUrl = mysqlUrl.trim();
                    if (cleanUrl.startsWith("mysql://")) {
                        cleanUrl = cleanUrl.substring("mysql://".length());
                        String userInfo = "";
                        String hostPortDb = cleanUrl;
                        if (cleanUrl.contains("@")) {
                            String[] parts = cleanUrl.split("@", 2);
                            userInfo = parts[0];
                            hostPortDb = parts[1];
                        }
                        String[] userParts = userInfo.split(":", 2);
                        if (userParts.length > 0 && !userParts[0].isEmpty()) {
                            jdbcUser = userParts[0];
                        }
                        if (userParts.length > 1) {
                            jdbcPassword = userParts[1];
                        }
                        jdbcUrl = "jdbc:mysql://" + hostPortDb + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
                        LOGGER.info("CampusNexa: Successfully parsed Railway MYSQL_URL for JDBC.");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to parse MYSQL_URL, falling back.", e);
                }
            } else {
                String rHost = System.getenv("MYSQLHOST");
                if (rHost == null || rHost.trim().isEmpty()) rHost = System.getenv("MYSQL_HOST");
                if (rHost != null && !rHost.trim().isEmpty()) {
                    String rPort = System.getenv("MYSQLPORT");
                    if (rPort == null || rPort.trim().isEmpty()) rPort = System.getenv("MYSQL_PORT");
                    if (rPort == null || rPort.trim().isEmpty()) rPort = "3306";
                    String rDb = System.getenv("MYSQLDATABASE");
                    if (rDb == null || rDb.trim().isEmpty()) rDb = System.getenv("MYSQL_DATABASE");
                    if (rDb == null || rDb.trim().isEmpty()) rDb = "railway";
                    jdbcUrl = String.format("jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                            rHost.trim(), rPort.trim(), rDb.trim());
                    LOGGER.info("CampusNexa: Auto-detected Railway MySQL host: " + rHost + ":" + rPort + "/" + rDb);
                }
            }
        }

        // 2. User resolution: DB_USER -> MYSQLUSER -> MYSQL_USER
        String envUser = System.getenv("DB_USER");
        if (envUser == null || envUser.trim().isEmpty()) envUser = System.getenv("MYSQLUSER");
        if (envUser == null || envUser.trim().isEmpty()) envUser = System.getenv("MYSQL_USER");
        if (envUser != null && !envUser.trim().isEmpty()) {
            jdbcUser = envUser.trim();
        }

        // 3. Password resolution: DB_PASSWORD -> MYSQLPASSWORD -> MYSQL_PASSWORD
        String envPassword = System.getenv("DB_PASSWORD");
        if (envPassword == null) envPassword = System.getenv("MYSQLPASSWORD");
        if (envPassword == null) envPassword = System.getenv("MYSQL_PASSWORD");
        if (envPassword != null) {
            jdbcPassword = envPassword;
        }

        // 4. System property overrides (e.g. -Ddb.url=...)
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
            LOGGER.log(Level.SEVERE, "CampusNexa JDBC connection test failed: " + e.getMessage(), e);
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
}
