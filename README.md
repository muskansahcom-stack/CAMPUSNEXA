# 🏢 CampusNexa — Enterprise Campus Maintenance Management System

CampusNexa is a full-featured, enterprise-grade Java web application designed for comprehensive campus maintenance tracking, grievance resolution, and facility management across universities and residential institutions.

---

## 🌟 Key Capabilities & Features

### 1. 👥 Multi-Role Campus Portals
* **Student Portal**: Lodge maintenance tickets, upload photographic evidence, track real-time SLA countdowns, provide post-resolution feedback, reopen tickets, or lodge whistleblower-shielded protected complaints.
* **Administrator Portal**: User management, category configuration, hostel and facility administration, RBAC permissions, system alert broadcasts, and audit log analysis.
* **Warden / Local Authority Portal**: View submitted grievances, assign qualified technicians, adjust priorities, escalate critical hazards, and communicate directly with complainants.
* **Higher Authority / COE Portal**: Review institutional escalations, monitor campus-wide overdue issues, issue executive directives, and review confidential protected grievances.
* **Maintenance Staff (Technician) Portal**: Receive work orders, log work commencement, update repair notes, and resolve work tickets with resolution remarks.

### 2. 🔄 9-Stage Ticket Lifecycle Workflow
```
SUBMITTED ──► UNDER_REVIEW ──► ASSIGNED ──► IN_PROGRESS ──► RESOLVED ──► CLOSED
     ▲                                                         │
     └─────────────────────── REOPENED ◄───────────────────────┘
                                 │
                                 ▼
                             ESCALATED
```

### 3. 🛡️ Whistleblower Protected Complaints
* Students can lodge sensitive or confidential grievances (ragging, food safety, harassment, integrity concerns).
* Student identity (name, username, room number, email) is cryptographically isolated in `protected_complaint_identity`.
* Identity is strictly masked as `Identity: 🔒 PROTECTED` across Warden, Technician, and Public dashboards.
* Only Higher Authorities (COE) with explicit statutory clearance can review protected complainant identity.

### 4. 🔔 Database-Backed Notification & Communication Hub
* 10 distinct notification types (`COMPLAINT_SUBMITTED`, `COMPLAINT_ASSIGNED`, `STATUS_UPDATED`, `COMPLAINT_RESOLVED`, `COMPLAINT_REOPENED`, `COMPLAINT_ESCALATED`, `ADMIN_MESSAGE`, `AUTHORITY_MESSAGE`, `PROTECTED_RESPONSE`, `SYSTEM_ALERT`).
* Real-time polling, unread badge counter, glassmorphic dropdown panel, and full notification inbox.
* Automatic broadcast system alerts with role-based delivery.

### 5. ⭐ Resolution Verification & Reopen Loop
* Upon resolution, students can verify satisfaction with a 1–5 star rating and feedback.
* If unsatisfied, the student can reopen the ticket with mandatory justification, resetting status to `REOPENED` and alerting the warden and technician.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 17+, Jakarta EE Servlets, JDBC PreparedStatements, Multi-Tier Service Architecture |
| **Web Server** | Apache Tomcat 11 |
| **Database** | MySQL 8.0+ (`maintenance_db`) with transaction isolation and audit logging |
| **Frontend** | Vanilla HTML5, Modern CSS3 Glassmorphism (`campusnexa-design-system.css`), ES6 JavaScript |
| **Build Tool** | Apache Maven |

---

## 📂 Project Structure

```
CAMPUSNEXA/
├── pom.xml                               # Maven project configuration
├── README.md                             # Comprehensive project documentation
├── .gitignore                            # Git exclusion rules
├── database/
│   ├── campusnexa_full_dump.sql          # Complete MySQL database export (schema + seed data)
│   ├── campusnexa_schema.sql             # Table creation DDL statements
│   └── schema.sql                        # Core legacy schema
├── src/
│   ├── main/
│   │   ├── java/com/campusnexa/
│   │   │   ├── config/                   # Database connection pool & App context listeners
│   │   │   ├── dao/                      # Data Access Objects (JDBC PreparedStatements)
│   │   │   ├── filter/                   # Authentication & RBAC Authorization Filters
│   │   │   ├── model/                    # Data models & POJOs
│   │   │   ├── service/                  # Business logic services
│   │   │   ├── servlet/                  # HTTP Servlets & REST Controllers
│   │   │   └── util/                     # Validation & JSON serialization utilities
│   │   ├── resources/
│   │   │   └── db.properties             # Database credentials configuration
│   │   └── webapp/
│   │       ├── WEB-INF/web.xml           # Servlet mapping & context configuration
│   │       ├── login.html                # Unified role-based login portal
│   │       ├── student-dashboard.html    # Student dashboard & complaint reporting
│   │       ├── admin-dashboard.html      # Enterprise admin management dashboard
│   │       ├── authority-dashboard.html  # Warden / Authority assignment dashboard
│   │       ├── higher-authority-dashboard.html # COE / Executive escalation dashboard
│   │       ├── staff-dashboard.html      # Maintenance technician mobile-friendly dashboard
│   │       ├── report.html               # Standalone issue filing form
│   │       ├── track.html                # Public issue tracker & timeline
│   │       ├── protected.html            # Protected complaint submission portal
│   │       ├── css/                      # Glassmorphic stylesheets & design system
│   │       └── js/                       # Client controllers & notification pollers
└── scratch/                              # Automated integration tests & verification scripts
```

---

## 🚀 Getting Started

### Prerequisites
* Java JDK 17 or higher
* Apache Maven 3.8+
* MySQL Server 8.0+
* Apache Tomcat 10.1 or 11.0

### 1. Database Setup
Import the complete pre-populated database dump:
```bash
mysql -u root -p < database/campusnexa_full_dump.sql
```
Verify the connection details in `src/main/resources/db.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/maintenance_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=
```

### 2. Build the Application
```bash
mvn clean package -DskipTests
```
This produces `target/campus-maintenance-system.war`.

### 3. Deploy to Tomcat
Deploy the WAR as `ROOT.war` in Tomcat's `webapps` directory:
```bash
cp target/campus-maintenance-system.war $CATALINA_HOME/webapps/ROOT.war
$CATALINA_HOME/bin/catalina start
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:8080/login.html
```

---

## 🔑 Default Demo Accounts

All demo accounts use the default password: `password`

| Role | Username | Display Name | Portal Focus |
| :--- | :--- | :--- | :--- |
| **Student** | `student1` | Muskan Sah | Issue Reporting, Tracking & Feedback |
| **Student** | `student2` | Diya Sen | Issue Reporting & Timeline Monitoring |
| **Admin** | `admin` | System Administrator | Full User, Hostel, Facility & RBAC Management |
| **Warden** | `warden1` | Dr. Suresh Varma | Work Order Dispatch & Authority Reviews |
| **Higher Authority** | `coe_admin` | Prof. Meenakshi Sundaram | COE Institutional Escalations & Directives |
| **Staff Technician** | `technician1`| Rajesh Sharma | Electrical & Mechanical Repair Execution |

*Instant 1-click login links are available in development via `/demo-login?role={ROLE}&user={USERNAME}`.*

---

## 📄 License
CampusNexa Enterprise Maintenance System — Open Academic & Institutional License.
