-- MySQL dump 10.13  Distrib 26.7.0, for macos26.6 (arm64)
--
-- Host: localhost    Database: maintenance_db
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `maintenance_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `maintenance_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `maintenance_db`;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_al_user` (`user_id`),
  KEY `idx_al_created` (`created_at`),
  CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000007 (Ceiling fan making screeching noise and regulator broken)','0:0:0:0:0:0:0:1','2026-09-25 04:43:09'),(2,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000008 (Contaminated cooking oil used in dining hall dinner)','0:0:0:0:0:0:0:1','2026-09-25 04:44:12'),(3,1,'ADMIN_ACCESS','Accessed system security parameters','127.0.0.1','2026-09-25 05:12:21'),(4,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000009 (Ceiling Fan Sparking and Noisy)','0:0:0:0:0:0:0:1','2026-09-25 17:26:06'),(5,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000010 (Continuous Water Pipe Burst and Severe Leakage)','0:0:0:0:0:0:0:1','2026-09-25 17:32:53'),(6,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000011 (Main Distribution Switchboard Sparking)','0:0:0:0:0:0:0:1','2026-09-25 17:33:07'),(7,2,'STATUS_UPDATED','Complaint ID 11 transitioned from SUBMITTED to IN_PROGRESS',NULL,'2026-09-25 17:50:10'),(8,2,'STATUS_UPDATED','Complaint ID 11 transitioned from IN_PROGRESS to RESOLVED',NULL,'2026-09-25 17:50:10'),(9,3,'STATUS_UPDATED','Complaint ID 11 transitioned from RESOLVED to CLOSED',NULL,'2026-09-25 17:50:37'),(10,3,'STATUS_UPDATED','Complaint ID 11 transitioned from CLOSED to REOPENED',NULL,'2026-09-25 17:50:37'),(11,1,'STATUS_UPDATED','Complaint ID 10 transitioned from SUBMITTED to UNDER_REVIEW',NULL,'2026-09-25 17:51:24'),(12,1,'STATUS_UPDATED','Complaint ID 10 transitioned from UNDER_REVIEW to ASSIGNED',NULL,'2026-09-25 17:51:24'),(13,1,'STATUS_UPDATED','Complaint ID 10 transitioned from ASSIGNED to IN_PROGRESS',NULL,'2026-09-25 17:51:24'),(14,5,'UPDATE_PRIORITY','Changed priority of complaint #3 to HIGH',NULL,'2026-09-25 18:06:59'),(15,5,'STATUS_UPDATED','Complaint ID 3 transitioned from SUBMITTED to UNDER_REVIEW',NULL,'2026-09-25 18:07:04'),(16,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000012 (Rotten / Contaminated Food in Evening Dinner)','0:0:0:0:0:0:0:1','2026-09-26 07:06:11'),(17,6,'HIGHER_AUTHORITY_DIRECTIVE','Complaint #2 directive: CONTRACTOR_PENALTY -> Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.',NULL,'2026-09-26 07:33:37'),(18,6,'HIGHER_AUTHORITY_DIRECTIVE','Complaint #6 directive: OFFICIAL_REMARKS -> Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.',NULL,'2026-09-26 07:33:37'),(19,6,'HIGHER_AUTHORITY_DIRECTIVE','Complaint #2 directive: CONTRACTOR_PENALTY -> Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.',NULL,'2026-09-26 07:34:02'),(20,6,'HIGHER_AUTHORITY_DIRECTIVE','Complaint #6 directive: OFFICIAL_REMARKS -> Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.',NULL,'2026-09-26 07:34:02'),(21,6,'HIGHER_AUTHORITY_DIRECTIVE','Complaint #11 directive: CONTRACTOR_PENALTY -> COE Board inspected chiller unit, summoned Deputy Warden, and mandated full contractor compressor overhaul.',NULL,'2026-09-26 09:19:09'),(22,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000013 (Phase 15 SLA Monitoring Test Complaint)','0:0:0:0:0:0:0:1','2026-09-26 14:12:35'),(23,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000014 (Phase 15 SLA Monitoring Test Complaint)','0:0:0:0:0:0:0:1','2026-09-26 14:53:48'),(24,5,'STATUS_UPDATED','Complaint ID 14 transitioned from ASSIGNED to IN_PROGRESS',NULL,'2026-09-26 14:53:50'),(25,5,'STATUS_UPDATED','Complaint ID 14 transitioned from IN_PROGRESS to RESOLVED',NULL,'2026-09-26 14:53:51'),(26,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000015 (Phase 15 SLA Monitoring Test Complaint)','0:0:0:0:0:0:0:1','2026-09-26 14:55:50'),(27,5,'STATUS_UPDATED','Complaint ID 15 transitioned from ASSIGNED to IN_PROGRESS',NULL,'2026-09-26 14:55:52'),(28,5,'STATUS_UPDATED','Complaint ID 15 transitioned from IN_PROGRESS to RESOLVED',NULL,'2026-09-26 14:55:53'),(29,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000017 (Phase 15 SLA Monitoring Test Complaint)','0:0:0:0:0:0:0:1','2026-09-26 15:00:20'),(30,5,'STATUS_UPDATED','Complaint ID 17 transitioned from ASSIGNED to IN_PROGRESS',NULL,'2026-09-26 15:00:22'),(31,5,'STATUS_UPDATED','Complaint ID 17 transitioned from IN_PROGRESS to RESOLVED',NULL,'2026-09-26 15:00:23'),(32,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000018 (Phase 15 SLA Monitoring Test Complaint)','0:0:0:0:0:0:0:1','2026-09-26 15:01:44'),(33,5,'STATUS_UPDATED','Complaint ID 20 transitioned from ASSIGNED to IN_PROGRESS',NULL,'2026-09-26 15:01:46'),(34,5,'STATUS_UPDATED','Complaint ID 20 transitioned from IN_PROGRESS to RESOLVED',NULL,'2026-09-26 15:01:47'),(35,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000021 (Phase 17 Test Leaking Faucet in Room 304)','0:0:0:0:0:0:0:1','2026-09-27 10:21:33'),(36,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000023 (Phase 17 Test Leaking Faucet in Room 304)','0:0:0:0:0:0:0:1','2026-09-27 10:22:34'),(37,1,'USER_CREATED','Created new user account: test_cadet_99 (Role: STUDENT)','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(38,1,'USER_UPDATED','Updated user details for: test_cadet_99 (ID: 30)','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(39,1,'USER_DEACTIVATED','Deactivated account ID 30','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(40,1,'USER_ACTIVATED','Activated account ID 30','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(41,1,'ROLE_ASSIGNED','Assigned role STAFF to user ID 30','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(42,1,'USER_DELETED','Deleted user ID 30','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(43,1,'PERMISSION_GRANTED','Explicitly granted permission \'VIEW_PROTECTED_IDENTITY\' to user ID 1','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(44,1,'PERMISSION_REVOKED','Revoked permission \'VIEW_PROTECTED_IDENTITY\' from user ID 1','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(45,1,'CATEGORY_CREATED','Created complaint category: HVAC & Temperature Control','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(46,1,'CATEGORY_DELETED','Deleted category ID: 13','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(47,1,'FACILITY_CREATED','Created facility: Robotics & AI Innovation Centre','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(48,1,'FACILITY_DELETED','Deleted facility ID: 7','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(49,1,'HOSTEL_CREATED','Created hostel: Kalpana Chawla Hall Block E','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(50,1,'HOSTEL_DELETED','Deleted hostel ID: 7','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(51,1,'STAFF_AVAILABILITY_CHANGED','Set availability to false for staff ID 1','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(52,1,'STAFF_AVAILABILITY_CHANGED','Set availability to true for staff ID 1','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(53,1,'ESCALATION_RULE_CONFIGURED','Updated rule ID 1 benchmarks: 2h response, 6h resolution','0:0:0:0:0:0:0:1','2026-09-28 06:32:19'),(54,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000023 (Mess Food Quality Issue)','0:0:0:0:0:0:0:1','2026-10-05 05:45:52'),(55,3,'COMPLAINT_CREATED','Created ticket CNX-2026-000025 (light is not working)','0:0:0:0:0:0:0:1','2026-10-06 10:54:07'),(56,1,'PERMISSION_GRANTED','Explicitly granted permission \'VIEW_PROTECTED_IDENTITY\' to user ID 1','0:0:0:0:0:0:0:1','2026-10-06 10:58:01');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authority_messages`
--

DROP TABLE IF EXISTS `authority_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authority_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `recipient_id` int DEFAULT NULL,
  `sender_role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_role` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'AUTHORITY',
  `message_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `is_protected_sender` tinyint(1) NOT NULL DEFAULT '0',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_am_recipient` (`recipient_id`),
  KEY `idx_am_complaint` (`complaint_id`),
  KEY `idx_am_sender` (`sender_id`),
  CONSTRAINT `fk_am_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_am_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_am_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authority_messages`
--

LOCK TABLES `authority_messages` WRITE;
/*!40000 ALTER TABLE `authority_messages` DISABLE KEYS */;
INSERT INTO `authority_messages` VALUES (1,1,5,3,'WARDEN','STUDENT','Electrician has been dispatched to check your AC water leakage.','Electrician has been dispatched to check your AC water leakage.',0,1,1,'2026-09-25 05:12:21'),(2,8,5,3,'WARDEN','STUDENT','We have initiated an unannounced inspection of the dining hall kitchen. Your confidentiality is strictly preserved.','We have initiated an unannounced inspection of the dining hall kitchen. Your confidentiality is strictly preserved.',0,1,1,'2026-09-25 18:07:17'),(3,6,6,NULL,'HIGHER_AUTHORITY','STUDENT','Official Order from COE Office: Inspection report with photographic evidence must be submitted by 17:00 hrs today.','Official Order from COE Office: Inspection report with photographic evidence must be submitted by 17:00 hrs today.',0,1,1,'2026-09-26 07:33:37'),(4,6,6,NULL,'HIGHER_AUTHORITY','STUDENT','Official Order from COE Office: Inspection report with photographic evidence must be submitted by 17:00 hrs today.','Official Order from COE Office: Inspection report with photographic evidence must be submitted by 17:00 hrs today.',0,1,1,'2026-09-26 07:34:02'),(5,8,3,NULL,'STUDENT','AUTHORITY','Student inquiry regarding mess inspection - timestamp 1790409781','Student inquiry regarding mess inspection - timestamp 1790409781',1,1,1,'2026-09-26 08:03:01'),(6,8,5,3,'WARDEN','STUDENT','Official warden response: The catering team has been summoned for inspection. Time: 1790409781','Official warden response: The catering team has been summoned for inspection. Time: 1790409781',0,1,1,'2026-09-26 08:03:01');
/*!40000 ALTER TABLE `authority_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_assignments`
--

DROP TABLE IF EXISTS `complaint_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ASSIGNED',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ca_assigned_by` (`assigned_by`),
  KEY `idx_ca_complaint` (`complaint_id`),
  KEY `idx_ca_staff` (`staff_id`),
  CONSTRAINT `fk_ca_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_assignments`
--

LOCK TABLES `complaint_assignments` WRITE;
/*!40000 ALTER TABLE `complaint_assignments` DISABLE KEYS */;
INSERT INTO `complaint_assignments` VALUES (1,1,2,1,'Test diagnostic inspection','ASSIGNED','2026-09-25 05:12:21',NULL,NULL),(2,9,2,5,'Dispatched to inspect ceiling fan sparks in Room 402','ASSIGNED','2026-09-25 18:06:41',NULL,NULL),(3,14,2,5,'Phase 15 SLA lifecycle test assignment','ASSIGNED','2026-09-26 14:53:49',NULL,NULL),(4,15,2,5,'Phase 15 SLA lifecycle test assignment','ASSIGNED','2026-09-26 14:55:51',NULL,NULL),(5,17,2,5,'Phase 15 SLA lifecycle test assignment','ASSIGNED','2026-09-26 15:00:21',NULL,NULL),(6,20,2,5,'Phase 15 SLA lifecycle test assignment','ASSIGNED','2026-09-26 15:01:45',NULL,NULL);
/*!40000 ALTER TABLE `complaint_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_categories`
--

DROP TABLE IF EXISTS `complaint_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 0xF09F938B,
  `default_sla_hours` int NOT NULL DEFAULT '24',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_categories`
--

LOCK TABLES `complaint_categories` WRITE;
/*!40000 ALTER TABLE `complaint_categories` DISABLE KEYS */;
INSERT INTO `complaint_categories` VALUES (1,'BUILDING_ROOMS','Buildings & Rooms','🏢',48,'Classroom, lab, door, window, wall, and ceiling defects','2026-09-25 04:15:32'),(2,'ELECTRICAL','Electrical','⚡',12,'Lighting, fans, switches, wiring faults, and power outages','2026-09-25 04:15:32'),(3,'PLUMBING_WATER','Plumbing & Water','🚰',12,'Washbasin, flush, taps, drainage, leakages, and water shortage','2026-09-25 04:15:32'),(4,'CLEANING_SANITATION','Cleaning & Sanitation','🧹',8,'Corridors, washrooms, garbage clearance, and general hygiene','2026-09-25 04:15:32'),(5,'MESS_FOOD','Mess & Food Quality','🍲',6,'Quality, hygiene, nutrition, foreign matter, and cooking standards','2026-09-25 04:15:32'),(6,'FURNITURE_INFRA','Furniture & Infrastructure','🪑',72,'Desks, benches, chairs, whiteboards, podiums, and lab fittings','2026-09-25 04:15:32'),(7,'AC_VENTILATION','AC & Ventilation','❄️',24,'Air conditioner failure, exhaust fans, and indoor climate control','2026-09-25 04:15:32'),(8,'IT_NETWORK','IT & Network','🌐',12,'Campus Wi-Fi, Ethernet jacks, lab workstation hardware, and projection systems','2026-09-25 04:15:32'),(9,'SECURITY_SAFETY','Security & Safety','🛡️',4,'Door locks, fire extinguishers, emergency lighting, and safety hazards','2026-09-25 04:15:32'),(10,'GROUNDS_OUTDOOR','Grounds & Outdoor','🌳',48,'Streetlights, walkways, sports courts, and landscape maintenance','2026-09-25 04:15:32'),(11,'OTHER','Other','📌',24,'General maintenance or uncategorized institutional complaints','2026-09-25 04:15:32');
/*!40000 ALTER TABLE `complaint_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_evidence`
--

DROP TABLE IF EXISTS `complaint_evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_evidence` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` bigint DEFAULT '0',
  `stage` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMISSION',
  `uploaded_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ce_user` (`uploaded_by`),
  KEY `idx_ce_complaint` (`complaint_id`),
  CONSTRAINT `fk_ce_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ce_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_evidence`
--

LOCK TABLES `complaint_evidence` WRITE;
/*!40000 ALTER TABLE `complaint_evidence` DISABLE KEYS */;
INSERT INTO `complaint_evidence` VALUES (1,11,'test_leak.png','uploads/evidence/1790357587535_68d96486_test_leak.png','image/png',70,'SUBMISSION',3,'2026-09-25 17:33:07'),(2,12,'rotten_food_evidence.jpg','uploads/evidence/1790406371959_e2c40875_rotten_food_evidence.jpg','image/jpeg',149,'SUBMISSION',3,'2026-09-26 07:06:11');
/*!40000 ALTER TABLE `complaint_evidence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_status_history`
--

DROP TABLE IF EXISTS `complaint_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `old_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `changed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_csh_user` (`changed_by`),
  KEY `idx_csh_complaint` (`complaint_id`),
  KEY `idx_csh_created` (`created_at`),
  CONSTRAINT `fk_csh_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_csh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_status_history`
--

LOCK TABLES `complaint_status_history` WRITE;
/*!40000 ALTER TABLE `complaint_status_history` DISABLE KEYS */;
INSERT INTO `complaint_status_history` VALUES (1,1,'SUBMITTED','RESOLVED','RESOLVED','System imported issue from baseline records',NULL,'2026-09-24 18:37:32'),(2,2,'SUBMITTED','IN_PROGRESS','IN_PROGRESS','System imported issue from baseline records',NULL,'2026-09-24 18:41:22'),(3,3,NULL,'SUBMITTED','SUBMITTED','System imported issue from baseline records',NULL,'2026-09-24 18:41:56'),(4,4,NULL,'SUBMITTED','SUBMITTED','System imported issue from baseline records',NULL,'2026-09-24 18:57:19'),(5,5,'SUBMITTED','RESOLVED','RESOLVED','System imported issue from baseline records',NULL,'2026-09-24 19:33:13'),(6,6,NULL,'SUBMITTED','SUBMITTED','System imported issue from baseline records',NULL,'2026-09-24 20:29:44'),(8,7,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-25 04:43:09'),(9,8,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-25 04:44:12'),(10,1,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Test diagnostic inspection',1,'2026-09-25 05:12:21'),(11,2,'SUBMITTED','ESCALATED','ESCALATED','Escalated to Higher Authority (CNX-ESC-2026-000001): Urgent electrical hazard pending over target SLA window',3,'2026-09-25 05:12:21'),(12,1,'SUBMITTED','CLOSED','CLOSED','Resolution confirmed by student with 5-star rating',3,'2026-09-25 05:12:21'),(13,9,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-25 17:26:06'),(14,10,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-25 17:32:53'),(15,11,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-25 17:33:07'),(16,11,'SUBMITTED','IN_PROGRESS','IN_PROGRESS','Technician arrived on site. Isolating switchboard circuits for diagnostic inspection.',2,'2026-09-25 17:50:10'),(17,11,'IN_PROGRESS','RESOLVED','RESOLVED','Replaced overheated terminal block, installed new 40A Siemens circuit breaker, verified zero spark load.',2,'2026-09-25 17:50:10'),(18,11,'RESOLVED','CLOSED','CLOSED','Confirmed fan and switchboard working perfectly. Thank you.',3,'2026-09-25 17:50:37'),(19,11,'CLOSED','REOPENED','REOPENED','Flickering occurred again during peak evening hours.',3,'2026-09-25 17:50:37'),(20,10,'SUBMITTED','UNDER_REVIEW','UNDER_REVIEW','Maintenance supervisor acknowledged severe water leakage. Priority verified as CRITICAL.',1,'2026-09-25 17:51:24'),(21,10,'UNDER_REVIEW','ASSIGNED','ASSIGNED','Assigned to Senior Plumber Suresh Kumar with emergency replacement pipe assembly.',1,'2026-09-25 17:51:24'),(22,10,'ASSIGNED','IN_PROGRESS','IN_PROGRESS','Plumbing crew on site. Main valve isolated; pipe segment cutting and replacement in progress.',1,'2026-09-25 17:51:24'),(23,9,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Dispatched to inspect ceiling fan sparks in Room 402',5,'2026-09-25 18:06:41'),(24,3,'SUBMITTED','SUBMITTED','SUBMITTED','Priority updated to HIGH: Urgent tap leak causing water accumulation',5,'2026-09-25 18:06:59'),(25,3,'SUBMITTED','UNDER_REVIEW','UNDER_REVIEW','Warden initial review completed',5,'2026-09-25 18:07:04'),(26,6,NULL,NULL,'ESCALATED','Escalated to Higher Authority (CNX-ESC-2026-000002): Repeated failure of contractor cleaning staff across 5th floor washrooms. Requires central contract penalty.',5,'2026-09-25 18:07:32'),(27,12,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 07:06:11'),(28,2,'ESCALATED','RESOLVED','RESOLVED','Higher Authority Directive (CONTRACTOR_PENALTY): Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.',6,'2026-09-26 07:33:37'),(29,6,'ESCALATED','ESCALATED','ESCALATED','Higher Authority Directive (OFFICIAL_REMARKS): Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.',6,'2026-09-26 07:33:37'),(30,2,'RESOLVED','RESOLVED','RESOLVED','Higher Authority Directive (CONTRACTOR_PENALTY): Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.',6,'2026-09-26 07:34:02'),(31,6,'ESCALATED','ESCALATED','ESCALATED','Higher Authority Directive (OFFICIAL_REMARKS): Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.',6,'2026-09-26 07:34:02'),(33,12,NULL,NULL,'ESCALATED','Escalated to Higher Authority (CNX-ESC-2026-000003): Complaint closed without proper resolution — Defect reappeared within 24 hours of supposed closure. Local technician never checked cooling lines.',3,'2026-09-26 09:16:08'),(34,11,NULL,NULL,'ESCALATED','Escalated to Higher Authority (CNX-ESC-2026-000005): Complaint closed without proper resolution — Defect reappeared within 24 hours of supposed closure. Local technician never checked cooling lines.',3,'2026-09-26 09:19:08'),(35,11,'ESCALATED','RESOLVED','RESOLVED','Higher Authority Directive (CONTRACTOR_PENALTY): COE Board inspected chiller unit, summoned Deputy Warden, and mandated full contractor compressor overhaul.',6,'2026-09-26 09:19:09'),(36,13,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 14:12:35'),(37,14,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 14:53:48'),(38,14,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Phase 15 SLA lifecycle test assignment',5,'2026-09-26 14:53:49'),(39,14,'ASSIGNED','IN_PROGRESS','IN_PROGRESS','Technician started inspection and repair.',5,'2026-09-26 14:53:50'),(40,14,'IN_PROGRESS','RESOLVED','RESOLVED','Issue resolved and tested under SLA monitoring.',5,'2026-09-26 14:53:51'),(41,15,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 14:55:50'),(42,15,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Phase 15 SLA lifecycle test assignment',5,'2026-09-26 14:55:51'),(43,15,'ASSIGNED','IN_PROGRESS','IN_PROGRESS','Technician started inspection and repair.',5,'2026-09-26 14:55:52'),(44,15,'IN_PROGRESS','RESOLVED','RESOLVED','Issue resolved and tested under SLA monitoring.',5,'2026-09-26 14:55:53'),(45,17,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 15:00:20'),(46,17,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Phase 15 SLA lifecycle test assignment',5,'2026-09-26 15:00:21'),(47,17,'ASSIGNED','IN_PROGRESS','IN_PROGRESS','Technician started inspection and repair.',5,'2026-09-26 15:00:22'),(48,17,'IN_PROGRESS','RESOLVED','RESOLVED','Issue resolved and tested under SLA monitoring.',5,'2026-09-26 15:00:23'),(49,20,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-26 15:01:44'),(50,20,'SUBMITTED','ASSIGNED','ASSIGNED','Assigned to maintenance technician: Phase 15 SLA lifecycle test assignment',5,'2026-09-26 15:01:45'),(51,20,'ASSIGNED','IN_PROGRESS','IN_PROGRESS','Technician started inspection and repair.',5,'2026-09-26 15:01:46'),(52,20,'IN_PROGRESS','RESOLVED','RESOLVED','Issue resolved and tested under SLA monitoring.',5,'2026-09-26 15:01:47'),(53,22,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-09-27 10:21:33'),(59,24,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-10-05 05:45:52'),(60,25,NULL,'SUBMITTED','SUBMITTED','Complaint registered via CampusNexa Portal',3,'2026-10-06 10:54:07');
/*!40000 ALTER TABLE `complaint_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `sub_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hostel_id` int DEFAULT NULL,
  `facility_id` int DEFAULT NULL,
  `building` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMITTED',
  `is_protected` tinyint(1) NOT NULL DEFAULT '0',
  `protection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_staff_id` int DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `work_started_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `sla_deadline` timestamp NULL DEFAULT NULL,
  `is_overdue` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `visibility` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDARD',
  PRIMARY KEY (`id`),
  UNIQUE KEY `complaint_number` (`complaint_number`),
  KEY `fk_complaints_category` (`category_id`),
  KEY `fk_complaints_hostel` (`hostel_id`),
  KEY `fk_complaints_facility` (`facility_id`),
  KEY `fk_complaints_assigned_by` (`assigned_by`),
  KEY `idx_comp_number` (`complaint_number`),
  KEY `idx_comp_user` (`user_id`),
  KEY `idx_comp_staff` (`assigned_staff_id`),
  KEY `idx_comp_status` (`status`),
  KEY `idx_comp_priority` (`priority`),
  KEY `idx_comp_protected` (`is_protected`),
  KEY `idx_comp_overdue` (`is_overdue`),
  KEY `idx_comp_created` (`created_at`),
  KEY `idx_comp_visibility` (`visibility`),
  CONSTRAINT `fk_complaints_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_category` FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`id`),
  CONSTRAINT `fk_complaints_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_hostel` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,'CNX-2026-000001',3,3,NULL,NULL,NULL,NULL,NULL,'Engineering Block B Room 204','AC Leaking Water','Air conditioner is dripping water onto the desks.','HIGH','CLOSED',0,NULL,2,1,'2026-09-25 05:12:21','2026-09-25 05:12:21',NULL,'2026-09-25 05:12:21',NULL,0,'2026-09-24 18:37:32','2026-09-26 13:48:01','STANDARD'),(2,'CNX-2026-000002',3,2,NULL,NULL,NULL,NULL,NULL,'Library 2nd Floor Study Room 5','Ceiling Fan Rattling and Unbalanced','Fan makes loud rattling noise and oscillates violently creating safety concern.','CRITICAL','RESOLVED',0,NULL,2,NULL,NULL,'2026-09-24 18:41:22','2026-09-26 07:34:02',NULL,NULL,0,'2026-09-24 18:41:22','2026-09-26 13:48:01','STANDARD'),(3,'CNX-2026-000003',3,3,NULL,NULL,NULL,NULL,NULL,'Hostel Block C Ground Floor','Water Tap Leaking','Washbasin tap dripping slowly.','HIGH','UNDER_REVIEW',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-09-24 18:41:56','2026-09-25 18:07:04','STANDARD'),(4,'CNX-2026-000004',4,8,NULL,NULL,NULL,NULL,NULL,'Hostel 2 2nd Floor Corridor','WiFi Router Dead in Dorm Hallway','The WiFi access point has no power lights and students have no internet.','HIGH','SUBMITTED',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-09-24 18:57:19','2026-09-24 18:57:19','STANDARD'),(5,'CNX-2026-000005',3,7,NULL,NULL,NULL,NULL,NULL,'Library 2nd Floor Study Hall','Broken Library AC Unit','AC unit making loud noise and leaking water','HIGH','RESOLVED',0,NULL,2,NULL,NULL,'2026-09-24 19:33:13',NULL,NULL,NULL,0,'2026-09-24 19:33:13','2026-09-26 13:48:01','STANDARD'),(6,'CNX-2026-000006',3,4,NULL,NULL,NULL,NULL,NULL,'LH3','washroom is not cleaned at  daily basis','from 2 weeks the 5th floors rooms and washrooms are not been cleaned','HIGH','ESCALATED',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-09-24 20:29:44','2026-09-26 07:34:02','STANDARD'),(7,'CNX-2026-000007',3,2,'Ceiling Fan',1,NULL,'','Room 304 Wing B','Room Room 304 Wing B','Ceiling fan making screeching noise and regulator broken','The ceiling fan regulator sparks when turned to speed 3 and the blade makes a screeching metal sound preventing study.','HIGH','SUBMITTED',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-25 08:13:10',0,'2026-09-25 04:43:09','2026-09-25 04:43:09','STANDARD'),(8,'CNX-2026-000008',3,5,'Food Quality',NULL,NULL,'Central Dining Hall','Counter 2','Central Dining Hall Room Counter 2','Contaminated cooking oil used in dining hall dinner','Black smoke and burning smell from re-used oil. Several students reported acute stomach upset.','CRITICAL','SUBMITTED',1,'Fear of Mess Contractor Retaliation',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-25 02:14:13',0,'2026-09-25 04:44:12','2026-09-26 06:52:30','PROTECTED'),(9,'CNX-2026-000009',3,2,'Ceiling Fan',1,NULL,'','Room 402','Room Room 402','Ceiling Fan Sparking and Noisy','Ceiling fan in Room 402 sparks whenever switched on and creates loud buzzing noise.','HIGH','ASSIGNED',0,'',2,5,'2026-09-25 18:06:41',NULL,NULL,NULL,'2026-09-25 20:56:07',0,'2026-09-25 17:26:06','2026-09-25 18:06:41','STANDARD'),(10,'CNX-2026-000010',3,3,'Water Tap Leak',1,NULL,'Boys Hostel 1','Room 214','2nd Floor Common Washroom','Continuous Water Pipe Burst and Severe Leakage','Severe water leakage from the main supply valve in the 2nd-floor washroom. Water is accumulating quickly and requires urgent plumbing attention.','CRITICAL','IN_PROGRESS',0,'',NULL,NULL,NULL,'2026-09-25 17:51:24',NULL,NULL,'2026-09-25 18:02:53',0,'2026-09-25 17:32:53','2026-09-26 13:48:01','STANDARD'),(11,'CNX-2026-000011',3,2,'Power Outage',NULL,NULL,'Academic Block B','Lab 305','3rd Floor Computer Lab 5','Main Distribution Switchboard Sparking','Severe sparks and burning odor from the main distribution panel inside Lab 305. High priority electrical hazard.','CRITICAL','RESOLVED',0,'',NULL,NULL,NULL,'2026-09-25 17:50:10','2026-09-26 09:19:09','2026-09-25 17:50:37','2026-09-25 18:03:08',0,'2026-09-25 17:33:07','2026-09-26 13:48:01','STANDARD'),(12,'CNX-2026-000012',3,5,'Rotten Food',NULL,NULL,'Central Dining Hall','Counter 2','Central Dining Hall Counter 2','Rotten / Contaminated Food in Evening Dinner','Rotten, sour sambar with visible decomposition and insect contaminants served during evening mess service. Poses acute gastric and health risk to hostel residents.','CRITICAL','ESCALATED',1,'Hygiene / Health Hazard Concern',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-26 04:36:12',0,'2026-09-26 07:06:11','2026-09-26 09:16:08','PROTECTED'),(13,'CNX-2026-000013',3,1,'General Maintenance',NULL,NULL,'','','Hostel Block A - Room 101','Phase 15 SLA Monitoring Test Complaint','Verifying full 4-stage lifecycle timestamps tracking and mathematical duration calculation','HIGH','SUBMITTED',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-27 20:42:36',0,'2026-09-26 14:12:35','2026-09-26 14:12:35','STANDARD'),(14,'CNX-2026-000014',3,2,'General Maintenance',NULL,NULL,'','','Hostel Block A - Room 101','Phase 15 SLA Monitoring Test Complaint','Verifying full 4-stage lifecycle timestamps tracking and mathematical duration calculation','HIGH','RESOLVED',0,'',2,5,'2026-09-26 14:53:49','2026-09-26 14:53:50','2026-09-26 14:53:51',NULL,'2026-09-26 18:23:49',0,'2026-09-26 14:53:48','2026-09-26 14:53:51','STANDARD'),(15,'CNX-2026-000015',3,2,'General Maintenance',NULL,NULL,'','','Hostel Block A - Room 101','Phase 15 SLA Monitoring Test Complaint','Verifying full 4-stage lifecycle timestamps tracking and mathematical duration calculation','HIGH','RESOLVED',0,'',2,5,'2026-09-26 14:55:51','2026-09-26 14:55:52','2026-09-26 14:55:53',NULL,'2026-09-26 18:25:50',0,'2026-09-26 14:55:50','2026-09-26 14:55:53','STANDARD'),(17,'CNX-2026-000017',3,2,'General Maintenance',NULL,NULL,'','','Hostel Block A - Room 101','Phase 15 SLA Monitoring Test Complaint','Verifying full 4-stage lifecycle timestamps tracking and mathematical duration calculation','HIGH','RESOLVED',0,'',2,5,'2026-09-26 15:00:21','2026-09-26 15:00:22','2026-09-26 15:00:23',NULL,'2026-09-26 18:30:20',0,'2026-09-26 15:00:20','2026-09-26 15:00:23','STANDARD'),(20,'CNX-2026-000018',3,2,'General Maintenance',NULL,NULL,'','','Hostel Block A - Room 101','Phase 15 SLA Monitoring Test Complaint','Verifying full 4-stage lifecycle timestamps tracking and mathematical duration calculation','HIGH','RESOLVED',0,'',2,5,'2026-09-26 15:01:45','2026-09-26 15:01:46','2026-09-26 15:01:47',NULL,'2026-09-26 18:31:45',0,'2026-09-26 15:01:44','2026-09-26 15:01:47','STANDARD'),(22,'CNX-2026-000021',3,1,'General Maintenance',NULL,NULL,'Kaveri Hostel','304','Kaveri Hostel, Room 304','Phase 17 Test Leaking Faucet in Room 304','Bathroom sink tap is leaking constantly and flooding floor.','HIGH','SUBMITTED',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-28 16:51:33',0,'2026-09-27 10:21:33','2026-09-27 10:21:33','STANDARD'),(24,'CNX-2026-000023',3,5,'General Maintenance',NULL,NULL,'','Mess Hall Counter 1','Hostel Mess','Mess Food Quality Issue','The food served today was half cooked and contained stones.','HIGH','SUBMITTED',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-05 04:15:53',0,'2026-10-05 05:45:52','2026-10-05 05:45:52','STANDARD'),(25,'CNX-2026-000025',3,2,'Tube Light/Bulb',4,NULL,'','Room no 420','Room Room no 420','light is not working','the light is not working since day 1. we have complaints in kafka online and offline both since 2 month already done but the problem yet not fixed','MEDIUM','SUBMITTED',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-06 17:24:07',0,'2026-10-06 10:54:07','2026-10-06 10:54:07','STANDARD');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escalation_rules`
--

DROP TABLE IF EXISTS `escalation_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escalation_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rule_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'CATEGORY',
  `expected_response_hours` int NOT NULL,
  `expected_resolution_hours` int NOT NULL,
  `priority_level` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_disclaimer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escalation_rules`
--

LOCK TABLES `escalation_rules` WRITE;
/*!40000 ALTER TABLE `escalation_rules` DISABLE KEYS */;
INSERT INTO `escalation_rules` VALUES (1,'Mess/Food','CATEGORY',2,6,NULL,'Critical rapid dispatch SLA','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-28 06:32:19'),(2,'Cleaning','CATEGORY',2,8,NULL,'Corridors, washrooms, garbage clearance, and sanitation monitoring','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-26 13:47:22'),(3,'Electrical','CATEGORY',3,12,NULL,'Wiring faults, lighting, power outage, and electrical hazard monitoring','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-26 13:47:22'),(4,'Water','CATEGORY',3,12,NULL,'Water leakages, plumbing failures, and drinking water monitoring','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-26 13:47:22'),(5,'Critical','PRIORITY',1,4,'CRITICAL','High hazard and critical priority grievances requiring immediate intervention','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-26 13:47:22'),(6,'General','CATEGORY',6,24,NULL,'General infrastructure, furniture, grounds, and other maintenance','Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.',1,'2026-09-26 13:47:22','2026-09-26 13:47:22');
/*!40000 ALTER TABLE `escalation_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escalations`
--

DROP TABLE IF EXISTS `escalations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escalations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `escalation_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `complaint_id` int NOT NULL,
  `raised_by` int DEFAULT NULL,
  `from_authority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'DEPUTY_WARDEN',
  `to_authority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'HIGHER_AUTHORITY',
  `escalated_by` int NOT NULL,
  `escalation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT_REQUEST',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING_REVIEW',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `response_deadline` timestamp NULL DEFAULT NULL,
  `action_taken` text COLLATE utf8mb4_unicode_ci,
  `action_by` int DEFAULT NULL,
  `action_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `escalation_number` (`escalation_number`),
  KEY `fk_esc_user` (`escalated_by`),
  KEY `fk_esc_action_by` (`action_by`),
  KEY `idx_esc_number` (`escalation_number`),
  KEY `idx_esc_complaint` (`complaint_id`),
  KEY `idx_esc_status` (`status`),
  CONSTRAINT `fk_esc_action_by` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_esc_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_esc_user` FOREIGN KEY (`escalated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escalations`
--

LOCK TABLES `escalations` WRITE;
/*!40000 ALTER TABLE `escalations` DISABLE KEYS */;
INSERT INTO `escalations` VALUES (1,'CNX-ESC-2026-000001',2,3,'DEPUTY_WARDEN','HIGHER_AUTHORITY',3,'SLA_BREACH','Urgent electrical hazard pending over target SLA window','ACTION_TAKEN','[CONTRACTOR_PENALTY] Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.','2026-09-25 23:42:21','[CONTRACTOR_PENALTY] Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.',6,'2026-09-26 07:34:02','2026-09-26 07:34:02','2026-09-25 05:12:21','2026-09-26 08:45:35'),(2,'CNX-ESC-2026-000002',6,5,'DEPUTY_WARDEN','HIGHER_AUTHORITY',5,'AUTHORITY_INTERVENTION','Repeated failure of contractor cleaning staff across 5th floor washrooms. Requires central contract penalty.','ACTION_TAKEN','[OFFICIAL_REMARKS] Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.','2026-09-26 12:37:33','[OFFICIAL_REMARKS] Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect.',6,'2026-09-26 07:33:37','2026-09-26 07:33:37','2026-09-25 18:07:32','2026-09-26 08:45:35'),(4,'CNX-ESC-2026-000003',12,3,'DEPUTY_WARDEN','HIGHER_AUTHORITY',3,'STUDENT_REQUEST','Complaint closed without proper resolution — Defect reappeared within 24 hours of supposed closure. Local technician never checked cooling lines.','PENDING_REVIEW',NULL,'2026-09-27 03:46:09',NULL,NULL,NULL,NULL,'2026-09-26 09:16:08','2026-09-26 09:16:08'),(5,'CNX-ESC-2026-000005',11,3,'DEPUTY_WARDEN','HIGHER_AUTHORITY',3,'STUDENT_REQUEST','Complaint closed without proper resolution — Defect reappeared within 24 hours of supposed closure. Local technician never checked cooling lines.','RESOLVED','[CONTRACTOR_PENALTY] COE Board inspected chiller unit, summoned Deputy Warden, and mandated full contractor compressor overhaul.','2026-09-27 03:49:09','[CONTRACTOR_PENALTY] COE Board inspected chiller unit, summoned Deputy Warden, and mandated full contractor compressor overhaul.',6,'2026-09-26 09:19:09','2026-09-26 09:19:09','2026-09-26 09:19:08','2026-09-26 09:19:09');
/*!40000 ALTER TABLE `escalations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `in_charge_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (1,'Central Library','Academic Core Block A',NULL,'2026-09-25 04:15:32'),(2,'Science & Engineering Labs','East Campus Tech Park',NULL,'2026-09-25 04:15:32'),(3,'Main Auditorium & Cultural Center','Campus Central Avenue',NULL,'2026-09-25 04:15:32'),(4,'Sports & Recreation Complex','West Campus Grounds',NULL,'2026-09-25 04:15:32'),(5,'Central Dining & Mess Facility','Hostel Quadrant B',NULL,'2026-09-25 04:15:32');
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `student_id` int NOT NULL,
  `rating` int NOT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `is_reopened` tinyint(1) NOT NULL DEFAULT '0',
  `reopen_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `complaint_id` (`complaint_id`),
  KEY `fk_fb_student` (`student_id`),
  KEY `idx_fb_complaint` (`complaint_id`),
  CONSTRAINT `fk_fb_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fb_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,1,3,5,'Prompt repair! AC is functioning perfectly now without leakage.','Prompt repair! AC is functioning perfectly now without leakage.',0,NULL,'2026-09-25 05:12:21');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostels`
--

DROP TABLE IF EXISTS `hostels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COED',
  `capacity` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostels`
--

LOCK TABLES `hostels` WRITE;
/*!40000 ALTER TABLE `hostels` DISABLE KEYS */;
INSERT INTO `hostels` VALUES (1,'Boys Hostel 1','MALE',300,'2026-09-25 04:15:32'),(2,'Boys Hostel 2','MALE',350,'2026-09-25 04:15:32'),(3,'Girls Hostel 1','FEMALE',300,'2026-09-25 04:15:32'),(4,'Girls Hostel 2','FEMALE',350,'2026-09-25 04:15:32'),(5,'PG & Research Scholar Hostel','COED',150,'2026-09-25 04:15:32');
/*!40000 ALTER TABLE `hostels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_issues`
--

DROP TABLE IF EXISTS `maintenance_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `assigned_staff_id` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REPORTED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issues_user_id` (`user_id`),
  KEY `idx_issues_status` (`status`),
  KEY `idx_issues_priority` (`priority`),
  KEY `idx_issues_created_at` (`created_at`),
  KEY `idx_issues_assigned_staff_id` (`assigned_staff_id`),
  CONSTRAINT `fk_maintenance_issues_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_maintenance_issues_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_issues`
--

LOCK TABLES `maintenance_issues` WRITE;
/*!40000 ALTER TABLE `maintenance_issues` DISABLE KEYS */;
INSERT INTO `maintenance_issues` VALUES (1,3,2,'AC Leaking Water','Air conditioner is dripping water onto the desks.','Engineering Block B Room 204','HIGH','RESOLVED','2026-09-24 18:37:32','2026-09-24 19:19:46'),(2,3,2,'Ceiling Fan Rattling and Unbalanced','Fan makes loud rattling noise and oscillates violently creating safety concern.','Library 2nd Floor Study Room 5','URGENT','IN_PROGRESS','2026-09-24 18:41:22','2026-09-24 19:19:41'),(3,3,NULL,'Water Tap Leaking','Washbasin tap dripping slowly.','Hostel Block C Ground Floor','LOW','REPORTED','2026-09-24 18:41:56','2026-09-24 18:41:56'),(4,4,NULL,'WiFi Router Dead in Dorm Hallway','The WiFi access point has no power lights and students have no internet.','Hostel 2 2nd Floor Corridor','HIGH','REPORTED','2026-09-24 18:57:19','2026-09-24 18:57:19'),(5,3,2,'Broken Library AC Unit','AC unit making loud noise and leaking water','Library 2nd Floor Study Hall','HIGH','RESOLVED','2026-09-24 19:33:13','2026-09-24 19:34:02'),(6,3,NULL,'washroom is not cleaned at  daily basis','from 2 weeks the 5th floors rooms and washrooms are not been cleaned','LH3','HIGH','REPORTED','2026-09-24 20:29:44','2026-09-24 20:29:44');
/*!40000 ALTER TABLE `maintenance_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_staff`
--

DROP TABLE IF EXISTS `maintenance_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialty` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `active_tasks` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_ms_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_staff`
--

LOCK TABLES `maintenance_staff` WRITE;
/*!40000 ALTER TABLE `maintenance_staff` DISABLE KEYS */;
INSERT INTO `maintenance_staff` VALUES (1,2,'Electrical & HVAC',1,6,'2026-09-25 04:17:26');
/*!40000 ALTER TABLE `maintenance_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recipient_user_id` int DEFAULT NULL,
  `complaint_id` int DEFAULT NULL,
  `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM_ALERT',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'Technician Assigned','Your ticket #CNX-2026-000001 has been assigned to Rajesh Sharma.','student-dashboard.html#track-complaint',1,'2026-09-25 05:12:21',3,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(2,1,'New message on Protected Complaint #CNX-2026-000008','Complainant sent an inquiry regarding protected ticket #CNX-2026-000008','/authority-dashboard.html#communication',0,'2026-09-26 08:03:01',1,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(3,5,'New message on Protected Complaint #CNX-2026-000008','Complainant sent an inquiry regarding protected ticket #CNX-2026-000008','/authority-dashboard.html#communication',0,'2026-09-26 08:03:01',5,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(4,3,'New official message on #CNX-2026-000008','Hostel Warden responded: \"Official warden response: The catering team has been summ...\"','/student-dashboard.html#messages',0,'2026-09-26 08:03:01',3,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(7,1,'Urgent Escalation CNX-ESC-2026-000003','Ticket #CNX-2026-000012 escalated: Complaint closed without proper resolution — Defect reappeared...','/higher-authority-dashboard.html#escalated',0,'2026-09-26 09:16:08',1,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(8,6,'Urgent Escalation CNX-ESC-2026-000003','Ticket #CNX-2026-000012 escalated: Complaint closed without proper resolution — Defect reappeared...','/higher-authority-dashboard.html#escalated',0,'2026-09-26 09:16:08',6,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(9,1,'Urgent Escalation CNX-ESC-2026-000005','Ticket #CNX-2026-000011 escalated: Complaint closed without proper resolution — Defect reappeared...','/higher-authority-dashboard.html#escalated',0,'2026-09-26 09:19:08',1,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(10,6,'Urgent Escalation CNX-ESC-2026-000005','Ticket #CNX-2026-000011 escalated: Complaint closed without proper resolution — Defect reappeared...','/higher-authority-dashboard.html#escalated',0,'2026-09-26 09:19:08',6,NULL,'SYSTEM_ALERT','MEDIUM',NULL),(11,3,'Complaint Submitted: #CNX-2026-000023','Your complaint \'Mess Food Quality Issue\' has been successfully registered and queued for administrative review.','/student-dashboard.html#track-complaint',0,'2026-10-05 05:45:52',3,24,'COMPLAINT_SUBMITTED','HIGH',NULL),(12,1,'New Complaint #CNX-2026-000023','New complaint submitted by Muskan Sah (#CNX-2026-000023): \'Mess Food Quality Issue\' at Hostel Mess (Priority: HIGH).','/authority-dashboard.html#incoming',0,'2026-10-05 05:45:52',1,24,'COMPLAINT_SUBMITTED','HIGH',NULL),(13,5,'New Complaint #CNX-2026-000023','New complaint submitted by Muskan Sah (#CNX-2026-000023): \'Mess Food Quality Issue\' at Hostel Mess (Priority: HIGH).','/authority-dashboard.html#incoming',0,'2026-10-05 05:45:52',5,24,'COMPLAINT_SUBMITTED','HIGH',NULL),(14,3,'Complaint Submitted: #CNX-2026-000025','Your complaint \'light is not working\' has been successfully registered and queued for administrative review.','/student-dashboard.html#track-complaint',0,'2026-10-06 10:54:07',3,25,'COMPLAINT_SUBMITTED','MEDIUM',NULL),(15,1,'New Complaint #CNX-2026-000025','New complaint submitted by Muskan Sah (#CNX-2026-000025): \'light is not working\' at Room Room no 420 (Priority: MEDIUM).','/authority-dashboard.html#incoming',0,'2026-10-06 10:54:07',1,25,'COMPLAINT_SUBMITTED','MEDIUM',NULL),(16,5,'New Complaint #CNX-2026-000025','New complaint submitted by Muskan Sah (#CNX-2026-000025): \'light is not working\' at Room Room no 420 (Priority: MEDIUM).','/authority-dashboard.html#incoming',0,'2026-10-06 10:54:07',5,25,'COMPLAINT_SUBMITTED','MEDIUM',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'MANAGE_USERS','Manage User Accounts','Create, update, and activate or deactivate user accounts','USER_MANAGEMENT','2026-09-27 10:31:29'),(2,'ASSIGN_ROLES','Assign System Roles','Assign and change user roles across all 5 tiers','USER_MANAGEMENT','2026-09-27 10:31:29'),(3,'MANAGE_STAFF','Manage Maintenance Staff','Manage technicians, specialties, workloads, and task assignments','STAFF_MANAGEMENT','2026-09-27 10:31:29'),(4,'MANAGE_CATEGORIES','Manage Complaint Categories','Create, update, and delete grievance categories and SLA defaults','CONFIGURATION','2026-09-27 10:31:29'),(5,'MANAGE_FACILITIES','Manage Facilities','Create, update, and delete campus academic and administrative facilities','INFRASTRUCTURE','2026-09-27 10:31:29'),(6,'MANAGE_HOSTELS','Manage Residential Hostels','Create, update, and delete student hostel blocks and capacities','INFRASTRUCTURE','2026-09-27 10:31:29'),(7,'CONFIGURE_ESCALATION','Configure Escalation Rules','Configure expected response and resolution benchmark hours','OPERATIONS','2026-09-27 10:31:29'),(8,'SYSTEM_SETTINGS','System Settings Control','Modify platform key-value configuration parameters','SYSTEM','2026-09-27 10:31:29'),(9,'VIEW_REPORTS','Access Analytics & Reports','View operational KPIs, SLA compliance rates, and complaint volume','REPORTING','2026-09-27 10:31:29'),(10,'VIEW_AUDIT_LOGS','View Audit Logs','Access security and activity audit trails','SECURITY','2026-09-27 10:31:29'),(11,'MANAGE_PERMISSIONS','Manage RBAC Permissions','Grant or revoke permissions to users and roles','SECURITY','2026-09-27 10:31:29'),(12,'VIEW_PROTECTED_IDENTITY','View Protected Student Identity','Access and decrypt confidential student whistleblower identities','CONFIDENTIAL_SECURITY','2026-09-27 10:31:29');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `protected_complaint_identity`
--

DROP TABLE IF EXISTS `protected_complaint_identity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `protected_complaint_identity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `student_id` int NOT NULL,
  `confidential_alias` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROTECTED_COMPLAINANT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `complaint_id` (`complaint_id`),
  KEY `fk_pci_student` (`student_id`),
  CONSTRAINT `fk_pci_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pci_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `protected_complaint_identity`
--

LOCK TABLES `protected_complaint_identity` WRITE;
/*!40000 ALTER TABLE `protected_complaint_identity` DISABLE KEYS */;
INSERT INTO `protected_complaint_identity` VALUES (1,8,3,'PROTECTED_COMPLAINANT_8','2026-09-25 04:44:12'),(2,12,3,'PROTECTED_COMPLAINANT_12','2026-09-26 07:06:11');
/*!40000 ALTER TABLE `protected_complaint_identity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (5,1),(5,2),(5,3),(5,4),(5,5),(5,6),(5,7),(5,8),(5,9),(5,10),(5,11);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'STUDENT','Student / Campus Resident Complaint Reporter','2026-09-25 04:15:32'),(2,'STAFF','Maintenance Technician & Field Execution Staff','2026-09-25 04:15:32'),(3,'WARDEN','Hostel Warden / Deputy / Department Authority','2026-09-25 04:15:32'),(4,'HIGHER_AUTHORITY','Higher Authority / Controller of Examinations (COE)','2026-09-25 04:15:32'),(5,'ADMIN','System Administrator with Facilities Governance','2026-09-25 04:15:32'),(11,'MAINTENANCE_STAFF','Maintenance Technician & Field Execution Staff','2026-09-25 05:16:57'),(12,'DEPUTY_WARDEN','Hostel Warden / Deputy / Department Authority','2026-09-25 05:16:57');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('auto_overdue_check','true','Enable periodic overdue SLA monitoring','2026-09-25 04:15:32'),('sla_critical_hours','6','Expected resolution SLA for Critical issues in hours','2026-09-25 04:15:32'),('sla_high_hours','12','Expected resolution SLA for High priority issues in hours','2026-09-25 04:15:32'),('sla_low_hours','48','Expected resolution SLA for Low priority issues in hours','2026-09-25 04:15:32'),('sla_medium_hours','24','Expected resolution SLA for Medium priority issues in hours','2026-09-25 04:15:32');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `granted_by` int DEFAULT NULL,
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES (1,12,1,'2026-10-06 10:58:01');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ur_role` (`role_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,5,'2026-09-25 04:17:26'),(2,2,'2026-09-25 04:17:26'),(3,1,'2026-09-25 04:17:26'),(4,1,'2026-09-25 04:17:26'),(5,3,'2026-09-25 04:17:26'),(6,4,'2026-09-25 04:17:26');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin123','ADMIN','2026-09-24 18:28:03','Institutional System Administrator',NULL,NULL,NULL,NULL,1,'2026-09-26 15:11:39'),(2,'technician1','tech123','STAFF','2026-09-24 18:28:03','Rajesh Sharma (Lead Electrician)',NULL,NULL,NULL,NULL,1,'2026-09-25 17:52:22'),(3,'student1','student123','STUDENT','2026-09-24 18:28:03','Muskan Sah','muskan.sah@campusnexa.edu',NULL,NULL,NULL,1,'2026-09-27 09:33:56'),(4,'student2','student123','STUDENT','2026-09-24 18:49:33','Diya Sen (Electronics Engineering)',NULL,NULL,NULL,NULL,1,'2026-09-26 07:10:20'),(5,'warden1','warden123','WARDEN','2026-09-25 04:17:26','Dr. Suresh Varma (Chief Hostel Warden)','warden1@campusnexa.edu','+91 98765 00005',NULL,NULL,1,'2026-09-27 09:26:43'),(6,'coe_admin','coe123','HIGHER_AUTHORITY','2026-09-25 04:17:26','Prof. Meenakshi Sundaram (COE / Institutional Authority)','coe@campusnexa.edu','+91 98765 00006',NULL,NULL,1,'2026-09-26 15:11:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21 11:12:09
