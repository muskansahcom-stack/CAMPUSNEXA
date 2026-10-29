-- =============================================================================
-- CampusNexa – Java-Based Campus Maintenance & Digital Complaint Management System
-- Normalized Production Database Schema
-- Target: MySQL 8.x / 9.x
-- =============================================================================

    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- Table 1: roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name, description) VALUES
    ('STUDENT', 'Student / Campus Resident Complaint Reporter'),
    ('STAFF', 'Maintenance Technician & Field Execution Staff'),
    ('WARDEN', 'Hostel Warden / Deputy / Department Authority'),
    ('HIGHER_AUTHORITY', 'Higher Authority / Controller of Examinations (COE)'),
    ('ADMIN', 'System Administrator with Facilities Governance')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- -----------------------------------------------------------------------------
-- Table 2: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT',
    full_name VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    department VARCHAR(100) NULL,
    room_number VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 3: user_roles (Many-to-Many mapping)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 4: hostels
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL DEFAULT 'COED', -- MALE, FEMALE, COED
    capacity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO hostels (name, type, capacity) VALUES
    ('Boys Hostel 1', 'MALE', 300),
    ('Boys Hostel 2', 'MALE', 350),
    ('Girls Hostel 1', 'FEMALE', 300),
    ('Girls Hostel 2', 'FEMALE', 350),
    ('PG & Research Scholar Hostel', 'COED', 150)
ON DUPLICATE KEY UPDATE type = VALUES(type);

-- -----------------------------------------------------------------------------
-- Table 5: facilities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    location_details VARCHAR(255) NULL,
    in_charge_name VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO facilities (name, location_details) VALUES
    ('Central Library', 'Academic Core Block A'),
    ('Science & Engineering Labs', 'East Campus Tech Park'),
    ('Main Auditorium & Cultural Center', 'Campus Central Avenue'),
    ('Sports & Recreation Complex', 'West Campus Grounds'),
    ('Central Dining & Mess Facility', 'Hostel Quadrant B')
ON DUPLICATE KEY UPDATE location_details = VALUES(location_details);

-- -----------------------------------------------------------------------------
-- Table 6: complaint_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(20) NOT NULL DEFAULT '📋',
    default_sla_hours INT NOT NULL DEFAULT 24,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO complaint_categories (code, name, icon, default_sla_hours, description) VALUES
    ('BUILDING_ROOMS', 'Buildings & Rooms', '🏢', 48, 'Classroom, lab, door, window, wall, and ceiling defects'),
    ('ELECTRICAL', 'Electrical', '⚡', 12, 'Lighting, fans, switches, wiring faults, and power outages'),
    ('PLUMBING_WATER', 'Plumbing & Water', '🚰', 12, 'Washbasin, flush, taps, drainage, leakages, and water shortage'),
    ('CLEANING_SANITATION', 'Cleaning & Sanitation', '🧹', 8, 'Corridors, washrooms, garbage clearance, and general hygiene'),
    ('MESS_FOOD', 'Mess & Food Quality', '🍲', 6, 'Quality, hygiene, nutrition, foreign matter, and cooking standards'),
    ('FURNITURE_INFRA', 'Furniture & Infrastructure', '🪑', 72, 'Desks, benches, chairs, whiteboards, podiums, and lab fittings'),
    ('AC_VENTILATION', 'AC & Ventilation', '❄️', 24, 'Air conditioner failure, exhaust fans, and indoor climate control'),
    ('IT_NETWORK', 'IT & Network', '🌐', 12, 'Campus Wi-Fi, Ethernet jacks, lab workstation hardware, and projection systems'),
    ('SECURITY_SAFETY', 'Security & Safety', '🛡️', 4, 'Door locks, fire extinguishers, emergency lighting, and safety hazards'),
    ('GROUNDS_OUTDOOR', 'Grounds & Outdoor', '🌳', 48, 'Streetlights, walkways, sports courts, and landscape maintenance'),
    ('OTHER', 'Other', '📌', 24, 'General maintenance or uncategorized institutional complaints')
ON DUPLICATE KEY UPDATE name = VALUES(name), default_sla_hours = VALUES(default_sla_hours);

-- -----------------------------------------------------------------------------
-- Table 7: complaints
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    sub_category VARCHAR(100) NULL,
    hostel_id INT NULL,
    facility_id INT NULL,
    building VARCHAR(150) NULL,
    room_number VARCHAR(50) NULL,
    location VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REOPENED, ESCALATED, REJECTED
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    protection_reason VARCHAR(255) NULL,
    assigned_staff_id INT NULL,
    assigned_by INT NULL,
    assigned_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    sla_deadline TIMESTAMP NULL,
    is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) REFERENCES complaint_categories (id),
    CONSTRAINT fk_complaints_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_facility FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_staff FOREIGN KEY (assigned_staff_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_comp_number (complaint_number),
    INDEX idx_comp_user (user_id),
    INDEX idx_comp_staff (assigned_staff_id),
    INDEX idx_comp_status (status),
    INDEX idx_comp_priority (priority),
    INDEX idx_comp_protected (is_protected),
    INDEX idx_comp_overdue (is_overdue),
    INDEX idx_comp_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 8: protected_complaint_identity
-- Strictly isolates complainant identity for confidential / protected tickets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protected_complaint_identity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    confidential_alias VARCHAR(50) NOT NULL DEFAULT 'PROTECTED_COMPLAINANT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pci_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_pci_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 9: complaint_status_history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    remarks TEXT NULL,
    changed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_csh_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_csh_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_csh_complaint (complaint_id),
    INDEX idx_csh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 10: complaint_assignments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_by INT NOT NULL,
    instructions TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED', -- ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_ca_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_ca_staff FOREIGN KEY (staff_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ca_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_ca_complaint (complaint_id),
    INDEX idx_ca_staff (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 11: complaint_evidence
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_evidence (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NULL,
    file_size_bytes BIGINT DEFAULT 0,
    stage VARCHAR(30) NOT NULL DEFAULT 'SUBMISSION', -- SUBMISSION, RESOLUTION, INSPECTION
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ce_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_ce_user FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_ce_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 12: escalations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escalations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    escalation_number VARCHAR(30) NOT NULL UNIQUE,
    complaint_id INT NOT NULL,
    escalated_by INT NOT NULL,
    escalation_type VARCHAR(50) NOT NULL DEFAULT 'STUDENT_REQUEST', -- STUDENT_REQUEST, AUTO_DEADLINE, WARDEN_ESCALATION
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, UNDER_INVESTIGATION, ACTION_TAKEN, CLOSED
    response_deadline TIMESTAMP NULL,
    action_taken TEXT NULL,
    action_by INT NULL,
    action_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_esc_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_esc_user FOREIGN KEY (escalated_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_esc_action_by FOREIGN KEY (action_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_esc_number (escalation_number),
    INDEX idx_esc_complaint (complaint_id),
    INDEX idx_esc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 13: authority_messages
-- Digital messaging between authorities and complainants (identity protected if applicable)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS authority_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    sender_id INT NOT NULL,
    recipient_id INT NULL,
    sender_role VARCHAR(30) NOT NULL,
    message_text TEXT NOT NULL,
    is_protected_sender BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_am_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_am_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_am_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_am_complaint (complaint_id),
    INDEX idx_am_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 14: feedback
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT NULL,
    comments TEXT NULL,
    is_reopened BOOLEAN NOT NULL DEFAULT FALSE,
    reopen_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fb_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_fb_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_fb_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 15: maintenance_staff (Technician specialties)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    specialty VARCHAR(100) NOT NULL, -- Electrician, Plumber, Carpenter, AC Technician, General
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    active_tasks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ms_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 16: notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 17: audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 18: system_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('sla_critical_hours', '6', 'Expected resolution SLA for Critical issues in hours'),
    ('sla_high_hours', '12', 'Expected resolution SLA for High priority issues in hours'),
    ('sla_medium_hours', '24', 'Expected resolution SLA for Medium priority issues in hours'),
    ('sla_low_hours', '48', 'Expected resolution SLA for Low priority issues in hours'),
    ('auto_overdue_check', 'true', 'Enable periodic overdue SLA monitoring')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- =============================================================================
-- SEED INITIAL 5 ROLE USERS
-- =============================================================================
INSERT INTO users (id, username, password, role, full_name, email, phone, is_active) VALUES
    (1, 'admin', 'admin123', 'ADMIN', 'Institutional System Administrator', 'admin@campusnexa.edu', '+91 98765 00001', TRUE),
    (2, 'technician1', 'tech123', 'STAFF', 'Rajesh Sharma (Lead Electrician)', 'technician1@campusnexa.edu', '+91 98765 00002', TRUE),
    (3, 'student1', 'student123', 'STUDENT', 'Muskan Sah', 'muskan.sah@campusnexa.edu', '+91 98765 00003', TRUE),
    (4, 'student2', 'student123', 'STUDENT', 'Diya Sen (Electronics Engineering)', 'student2@campusnexa.edu', '+91 98765 00004', TRUE),
    (5, 'warden1', 'warden123', 'WARDEN', 'Dr. Suresh Varma (Chief Hostel Warden)', 'warden1@campusnexa.edu', '+91 98765 00005', TRUE),
    (6, 'coe_admin', 'coe123', 'HIGHER_AUTHORITY', 'Prof. Meenakshi Sundaram (COE / Institutional Authority)', 'coe@campusnexa.edu', '+91 98765 00006', TRUE)
ON DUPLICATE KEY UPDATE
    role = VALUES(role),
    password = VALUES(password),
    full_name = VALUES(full_name);

-- Seed user_roles mappings
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u
JOIN roles r ON u.role = r.name
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Seed technician details
INSERT INTO maintenance_staff (user_id, specialty, is_available) VALUES
    (2, 'Electrical & HVAC', TRUE)
ON DUPLICATE KEY UPDATE specialty = VALUES(specialty);

-- =============================================================================
-- MIGRATE EXISTING ISSUES FROM maintenance_issues INTO complaints
-- =============================================================================
INSERT INTO complaints (
    id, complaint_number, user_id, category_id, location, title, description, priority, status, assigned_staff_id, created_at, updated_at
)
SELECT
    m.id,
    CONCAT('CNX-2026-', LPAD(m.id, 6, '0')),
    m.user_id,
    COALESCE(
        CASE
            WHEN LOWER(m.title) LIKE '%fan%' OR LOWER(m.title) LIKE '%light%' THEN (SELECT id FROM complaint_categories WHERE code='ELECTRICAL' LIMIT 1)
            WHEN LOWER(m.title) LIKE '%tap%' OR LOWER(m.title) LIKE '%water%' OR LOWER(m.title) LIKE '%washbasin%' THEN (SELECT id FROM complaint_categories WHERE code='PLUMBING_WATER' LIMIT 1)
            WHEN LOWER(m.title) LIKE '%ac%' OR LOWER(m.title) LIKE '%air%' THEN (SELECT id FROM complaint_categories WHERE code='AC_VENTILATION' LIMIT 1)
            WHEN LOWER(m.title) LIKE '%washroom%' OR LOWER(m.title) LIKE '%clean%' THEN (SELECT id FROM complaint_categories WHERE code='CLEANING_SANITATION' LIMIT 1)
            WHEN LOWER(m.title) LIKE '%wifi%' OR LOWER(m.title) LIKE '%network%' OR LOWER(m.title) LIKE '%router%' THEN (SELECT id FROM complaint_categories WHERE code='IT_NETWORK' LIMIT 1)
            ELSE (SELECT id FROM complaint_categories WHERE code='OTHER' LIMIT 1)
        END,
        (SELECT id FROM complaint_categories WHERE code='OTHER' LIMIT 1)
    ),
    m.location,
    m.title,
    m.description,
    CASE
        WHEN m.priority = 'URGENT' THEN 'CRITICAL'
        ELSE m.priority
    END,
    CASE
        WHEN m.status = 'REPORTED' THEN 'SUBMITTED'
        ELSE m.status
    END,
    m.assigned_staff_id,
    m.created_at,
    m.updated_at
FROM maintenance_issues m
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    status = VALUES(status),
    priority = VALUES(priority);

-- Seed initial status history for existing migrated complaints
INSERT INTO complaint_status_history (complaint_id, status, remarks, created_at)
SELECT c.id, c.status, 'System imported issue from baseline records', c.created_at
FROM complaints c
WHERE NOT EXISTS (SELECT 1 FROM complaint_status_history h WHERE h.complaint_id = c.id);
