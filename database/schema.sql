-- =============================================================================
-- Campus Maintenance Management System
-- Database Schema Definition
-- Target Database: MySQL 8.x / 9.x
-- =============================================================================

CREATE DATABASE IF NOT EXISTS maintenance_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE maintenance_db;

-- -----------------------------------------------------------------------------
-- Table 1: users
-- Stores system users including students, staff, and administrators
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 2: maintenance_issues
-- Stores maintenance complaint/issue tickets reported across campus
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assigned_staff_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_issues_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_issues_staff
        FOREIGN KEY (assigned_staff_id) REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_issues_user_id (user_id),
    INDEX idx_issues_assigned_staff_id (assigned_staff_id),
    INDEX idx_issues_status (status),
    INDEX idx_issues_priority (priority),
    INDEX idx_issues_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SAMPLE DEVELOPMENT DATA ONLY
-- DO NOT USE IN PRODUCTION ENVIRONMENTS
-- =============================================================================
INSERT INTO users (username, password, role) VALUES
    ('admin', 'admin123', 'ADMIN'),
    ('technician1', 'tech123', 'STAFF'),
    ('student1', 'student123', 'STUDENT'),
    ('student2', 'student123', 'STUDENT')
ON DUPLICATE KEY UPDATE username = VALUES(username);
