package com.campusnexa.servlet;

import com.campusnexa.dao.ComplaintDAO;
import com.campusnexa.dao.UserDAO;
import com.campusnexa.model.Category;
import com.campusnexa.model.Complaint;
import com.campusnexa.model.ComplaintEvidence;
import com.campusnexa.model.ComplaintStatusHistory;
import com.campusnexa.model.Facility;
import com.campusnexa.model.Hostel;
import com.campusnexa.model.User;
import com.campusnexa.service.NotificationService;
import com.campusnexa.util.ValidationUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Enterprise Servlet managing Complaint submissions, queries, categories, and lifecycles.
 */
@WebServlet(name = "ComplaintServlet", urlPatterns = {
        "/api/complaints",
        "/api/complaints/*",
        "/api/categories",
        "/api/hostels",
        "/api/facilities",
        "/report-issue",
        "/reportIssue",
        "/api/issues"
})
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,      // 1 MB
        maxFileSize = 1024 * 1024 * 5,        // 5 MB max per file
        maxRequestSize = 1024 * 1024 * 20     // 20 MB max total request
)
public class ComplaintServlet extends HttpServlet {

    private final ComplaintDAO complaintDAO;

    public ComplaintServlet() {
        this(new ComplaintDAO());
    }

    public ComplaintServlet(ComplaintDAO complaintDAO) {
        this.complaintDAO = complaintDAO;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();
        String pathInfo = request.getPathInfo();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // 1. Public or Semi-Public Reference Data (Categories, Hostels, Facilities)
        if ("/api/categories".equals(path)) {
            List<Category> categories = complaintDAO.getAllCategories();
            out.write(toJsonCategories(categories));
            return;
        }

        if ("/api/hostels".equals(path)) {
            List<Hostel> hostels = complaintDAO.getAllHostels();
            out.write(toJsonHostels(hostels));
            return;
        }

        if ("/api/facilities".equals(path)) {
            List<Facility> facilities = complaintDAO.getAllFacilities();
            out.write(toJsonFacilities(facilities));
            return;
        }

        // 2. Protected Endpoints: Require active authenticated session
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"error\":\"Authentication required\"}");
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        // 3. Stats Endpoint: /api/complaints/stats
        if ("/api/complaints".equals(path) && "/stats".equals(pathInfo)) {
            Map<String, Integer> stats = complaintDAO.getStudentStats(userId);
            out.write(String.format(
                    "{\"total\":%d,\"pending\":%d,\"inProgress\":%d,\"resolved\":%d,\"escalated\":%d}",
                    stats.get("total"), stats.get("pending"), stats.get("inProgress"),
                    stats.get("resolved"), stats.get("escalated")
            ));
            return;
        }

        // 4. Detail Endpoint: /api/complaints/detail?id=... or ?number=...
        if ("/api/complaints".equals(path) && "/detail".equals(pathInfo)) {
            String idParam = request.getParameter("id");
            String numParam = request.getParameter("number");
            Complaint complaint = null;

            if (ValidationUtil.isNotEmpty(numParam)) {
                complaint = complaintDAO.getComplaintByNumber(numParam.trim());
            } else if (ValidationUtil.isNotEmpty(idParam)) {
                try {
                    complaint = complaintDAO.getComplaintById(Integer.parseInt(idParam.trim()));
                } catch (NumberFormatException ignored) {}
            }

            if (complaint == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"error\":\"Complaint not found\"}");
                return;
            }

            // Authorization: Students can only view their own complaints
            if ("STUDENT".equals(role)) {
                boolean isOwner = (complaint.getUserId() == userId);
                if (!isOwner) {
                    isOwner = complaintDAO.isProtectedComplaintOwner(complaint.getId(), userId);
                }
                if (!isOwner) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"error\":\"Access denied to another student's complaint\"}");
                    return;
                }
            }

            List<ComplaintStatusHistory> timeline = complaintDAO.getTimeline(complaint.getId());
            Map<String, Object> resolutionDetails = complaintDAO.getResolutionDetails(complaint.getId());
            out.write(toJsonComplaintDetail(complaint, timeline, resolutionDetails, role));
            return;
        }

        // 5. Timeline Endpoint: /api/complaints/timeline?id=...
        if ("/api/complaints".equals(path) && "/timeline".equals(pathInfo)) {
            String idParam = request.getParameter("id");
            if (!ValidationUtil.isNotEmpty(idParam)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Missing complaint id parameter\"}");
                return;
            }
            try {
                int complaintId = Integer.parseInt(idParam.trim());
                Complaint comp = complaintDAO.getComplaintById(complaintId);
                boolean maskTimeline = (comp != null && (comp.isProtected() || "PROTECTED".equalsIgnoreCase(comp.getVisibility()))) && !"ADMIN".equals(role) && !"STUDENT".equals(role);
                List<ComplaintStatusHistory> timeline = complaintDAO.getTimeline(complaintId);
                out.write(toJsonTimeline(timeline, maskTimeline));
                return;
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Invalid complaint id\"}");
                return;
            }
        }

        // 6. Complaints List: /api/complaints or /api/issues
        List<Complaint> complaints;
        if ("STUDENT".equals(role)) {
            complaints = complaintDAO.getComplaintsByUserId(userId);
        } else if ("STAFF".equals(role)) {
            complaints = complaintDAO.getComplaintsByStaffId(userId);
        } else {
            // ADMIN, WARDEN, HIGHER_AUTHORITY can view broader lists with filters
            String statusFilter = request.getParameter("status");
            String priorityFilter = request.getParameter("priority");
            String catParam = request.getParameter("categoryId");
            Integer categoryId = null;
            if (ValidationUtil.isNotEmpty(catParam)) {
                try { categoryId = Integer.parseInt(catParam.trim()); } catch (NumberFormatException ignored) {}
            }
            complaints = complaintDAO.getAllComplaints(statusFilter, priorityFilter, categoryId);
        }

        out.write(toJsonComplaints(complaints, role));
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        boolean isAjax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With")) ||
                (request.getHeader("Accept") != null && request.getHeader("Accept").contains("application/json"));

        if (session == null || session.getAttribute("userId") == null) {
            if (isAjax) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Session expired. Please log in again.\"}");
            } else {
                response.sendRedirect(request.getContextPath() + "/login.html?error=Session+expired");
            }
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        String pathInfo = request.getPathInfo();
        String action = getFormField(request, "action");
        if ("/status".equals(pathInfo) || "/update-status".equals(pathInfo) || "updateStatus".equalsIgnoreCase(action)) {
            handleStatusUpdate(request, response, session, userId, role);
            return;
        }

        if (!"STUDENT".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            if (isAjax) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Only student or admin accounts can log issues.\"}");
            } else {
                response.sendRedirect(request.getContextPath() + "/student-dashboard.html?error=Unauthorized");
            }
            return;
        }

        // Parameter Extraction (Supports both URL-encoded and Multipart form data)
        String title = getFormField(request, "title");
        String description = getFormField(request, "description");
        String location = getFormField(request, "location");
        String priority = getFormField(request, "priority");
        String catParam = getFormField(request, "categoryId");
        String subCategory = getFormField(request, "subCategory");
        String hostelParam = getFormField(request, "hostelId");
        String facilityParam = getFormField(request, "facilityId");
        String building = getFormField(request, "building");
        String roomNumber = getFormField(request, "roomNumber");
        String isProtectedParam = getFormField(request, "isProtected");
        String protectionReason = getFormField(request, "protectionReason");

        // Server-Side Input Validation (Phase 7 Spec)
        if (!ValidationUtil.isNotEmpty(title)) {
            sendError(response, isAjax, request.getContextPath(), "Issue title is required.");
            return;
        }
        if (title.trim().length() < 3 || title.trim().length() > 200) {
            sendError(response, isAjax, request.getContextPath(), "Title must be between 3 and 200 characters.");
            return;
        }

        if (!ValidationUtil.isNotEmpty(description)) {
            sendError(response, isAjax, request.getContextPath(), "Detailed description is required.");
            return;
        }
        if (description.trim().length() < 5) {
            sendError(response, isAjax, request.getContextPath(), "Description must be at least 5 characters.");
            return;
        }

        // Priority validation (LOW, MEDIUM, HIGH, CRITICAL)
        if (!ValidationUtil.isNotEmpty(priority) || !ValidationUtil.isValidPriority(priority)) {
            priority = "MEDIUM";
        } else {
            priority = priority.trim().toUpperCase();
        }

        int categoryId = 1; // Default
        if (ValidationUtil.isNotEmpty(catParam)) {
            try {
                categoryId = Integer.parseInt(catParam.trim());
            } catch (NumberFormatException ignored) {}
        }

        Integer hostelId = null;
        if (ValidationUtil.isNotEmpty(hostelParam)) {
            try {
                int hId = Integer.parseInt(hostelParam.trim());
                if (hId > 0) hostelId = hId;
            } catch (NumberFormatException ignored) {}
        }

        Integer facilityId = null;
        if (ValidationUtil.isNotEmpty(facilityParam)) {
            try {
                int fId = Integer.parseInt(facilityParam.trim());
                if (fId > 0) facilityId = fId;
            } catch (NumberFormatException ignored) {}
        }

        // Location formatting & validation
        if (!ValidationUtil.isNotEmpty(location)) {
            StringBuilder locBuilder = new StringBuilder();
            if (ValidationUtil.isNotEmpty(building)) locBuilder.append(building.trim()).append(" ");
            if (ValidationUtil.isNotEmpty(roomNumber)) locBuilder.append("Room ").append(roomNumber.trim());
            location = locBuilder.toString().trim();
            if (location.isEmpty()) {
                location = "Campus Premises";
            }
        }

        // Evidence/Photograph File Upload & Validation
        Part evidencePart = null;
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().startsWith("multipart/")) {
            try {
                evidencePart = request.getPart("evidence");
                if (evidencePart == null) {
                    evidencePart = request.getPart("photo");
                }
            } catch (Exception ignored) {}
        }

        if (evidencePart != null && evidencePart.getSize() > 0) {
            long size = evidencePart.getSize();
            if (size > 5 * 1024 * 1024) { // 5 MB max
                sendError(response, isAjax, request.getContextPath(), "Evidence photograph exceeds the maximum 5MB size limit.");
                return;
            }

            String submittedName = evidencePart.getSubmittedFileName();
            if (submittedName != null && !submittedName.trim().isEmpty()) {
                String baseName = Paths.get(submittedName).getFileName().toString();
                String lowerName = baseName.toLowerCase();

                boolean validExtension = lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") ||
                                         lowerName.endsWith(".png") || lowerName.endsWith(".webp") ||
                                         lowerName.endsWith(".pdf");

                boolean isDangerous = lowerName.endsWith(".exe") || lowerName.endsWith(".sh") ||
                                      lowerName.endsWith(".jsp") || lowerName.endsWith(".jspx") ||
                                      lowerName.endsWith(".php") || lowerName.endsWith(".html") ||
                                      lowerName.endsWith(".js") || lowerName.endsWith(".war") ||
                                      lowerName.endsWith(".bat") || lowerName.endsWith(".cmd");

                if (!validExtension || isDangerous) {
                    sendError(response, isAjax, request.getContextPath(), "Invalid file format. Only JPG, PNG, WEBP, and PDF photographs are allowed.");
                    return;
                }
            }
        }

        String visibilityParam = getFormField(request, "visibility");
        boolean isProtected = "true".equalsIgnoreCase(isProtectedParam) ||
                "1".equals(isProtectedParam) ||
                "on".equalsIgnoreCase(isProtectedParam) ||
                "PROTECTED".equalsIgnoreCase(visibilityParam);
        String visibility = isProtected ? "PROTECTED" : "STANDARD";

        Complaint complaint = new Complaint();
        complaint.setUserId(userId);
        complaint.setCategoryId(categoryId);
        complaint.setSubCategory(subCategory != null ? subCategory.trim() : "General Maintenance");
        complaint.setHostelId(hostelId);
        complaint.setFacilityId(facilityId);
        complaint.setBuilding(building != null ? building.trim() : "");
        complaint.setRoomNumber(roomNumber != null ? roomNumber.trim() : "");
        complaint.setLocation(location);
        complaint.setTitle(title.trim());
        complaint.setDescription(description.trim());
        complaint.setPriority(priority);
        complaint.setStatus("SUBMITTED");
        complaint.setProtected(isProtected);
        complaint.setVisibility(visibility);
        complaint.setProtectionReason(protectionReason != null ? protectionReason.trim() : "");

        String clientIp = request.getRemoteAddr();
        boolean created = complaintDAO.createComplaint(complaint, clientIp);

        if (created) {
            // Save and persist evidence photograph if provided
            if (evidencePart != null && evidencePart.getSize() > 0) {
                try {
                    String uploadDir = getServletContext().getRealPath("/uploads/evidence");
                    if (uploadDir == null) {
                        uploadDir = System.getProperty("java.io.tmpdir") + File.separator + "campusnexa_uploads";
                    }
                    File uploadFolder = new File(uploadDir);
                    if (!uploadFolder.exists()) {
                        uploadFolder.mkdirs();
                    }

                    String submittedName = evidencePart.getSubmittedFileName();
                    String baseName = (submittedName != null) ? Paths.get(submittedName).getFileName().toString() : "evidence.jpg";
                    String safeStoredName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
                    File destFile = new File(uploadFolder, safeStoredName);
                    evidencePart.write(destFile.getAbsolutePath());

                    complaintDAO.addEvidence(complaint.getId(), baseName, "uploads/evidence/" + safeStoredName, evidencePart.getContentType(), evidencePart.getSize(), userId);
                } catch (Exception e) {
                    // Non-fatal for complaint creation
                }
            }

            // Phase 19: Database-backed automated notifications
            try {
                UserDAO userDAO = new UserDAO();
                User studentUser = userDAO.findById(userId);
                new NotificationService().notifyComplaintSubmitted(complaint, studentUser);
            } catch (Exception notifEx) {
                // Non-fatal notification trigger
            }

            if (isAjax) {
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(String.format(
                        "{\"success\":true,\"complaintId\":%d,\"complaintNumber\":\"%s\",\"message\":\"Complaint submitted successfully.\"}",
                        complaint.getId(),
                        complaint.getComplaintNumber()
                ));
            } else {
                response.sendRedirect(request.getContextPath() + "/report.html?success=true&complaintNumber=" + complaint.getComplaintNumber());
            }
        } else {
            sendError(response, isAjax, request.getContextPath(), "Failed to save complaint. Please try again.");
        }
    }

    private void sendError(HttpServletResponse response, boolean isAjax, String contextPath, String message)
            throws IOException {
        if (isAjax) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(String.format("{\"success\":false,\"message\":\"%s\"}", ValidationUtil.escapeJson(message)));
        } else {
            response.sendRedirect(contextPath + "/student-dashboard.html?error=" + ValidationUtil.escapeJson(message));
        }
    }

    private String toJsonCategories(List<Category> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Category c = list.get(i);
            sb.append("{")
                    .append("\"id\":").append(c.getId()).append(",")
                    .append("\"code\":\"").append(ValidationUtil.escapeJson(c.getCode())).append("\",")
                    .append("\"name\":\"").append(ValidationUtil.escapeJson(c.getName())).append("\",")
                    .append("\"icon\":\"").append(ValidationUtil.escapeJson(c.getIcon())).append("\",")
                    .append("\"defaultSlaHours\":").append(c.getDefaultSlaHours()).append(",")
                    .append("\"description\":\"").append(ValidationUtil.escapeJson(c.getDescription())).append("\"")
                    .append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJsonHostels(List<Hostel> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Hostel h = list.get(i);
            sb.append("{")
                    .append("\"id\":").append(h.getId()).append(",")
                    .append("\"name\":\"").append(ValidationUtil.escapeJson(h.getName())).append("\",")
                    .append("\"type\":\"").append(ValidationUtil.escapeJson(h.getType())).append("\",")
                    .append("\"capacity\":").append(h.getCapacity())
                    .append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJsonFacilities(List<Facility> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Facility f = list.get(i);
            sb.append("{")
                    .append("\"id\":").append(f.getId()).append(",")
                    .append("\"name\":\"").append(ValidationUtil.escapeJson(f.getName())).append("\",")
                    .append("\"locationDetails\":\"").append(ValidationUtil.escapeJson(f.getLocationDetails())).append("\",")
                    .append("\"inChargeName\":\"").append(ValidationUtil.escapeJson(f.getInChargeName())).append("\"")
                    .append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJsonComplaints(List<Complaint> list, String viewerRole) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Complaint c = list.get(i);
            sb.append(complaintToJsonObject(c, viewerRole));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String complaintToJsonObject(Complaint c, String viewerRole) {
        // Enforce Protected Complaint Masking:
        // If protected, authorities and staff strictly receive masked identity
        boolean isProt = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
        String reporterDisplay = c.getStudentUsername();
        String studentName = c.getStudentFullName();
        int reportedUserId = c.getUserId();

        if (isProt && !"ADMIN".equals(viewerRole) && !"STUDENT".equals(viewerRole)) {
            reporterDisplay = "PROTECTED_COMPLAINANT";
            studentName = "Identity: 🔒 PROTECTED";
            reportedUserId = 0;
        }

        String vis = c.getVisibility() != null ? c.getVisibility() : (isProt ? "PROTECTED" : "STANDARD");

        return "{" +
                "\"id\":" + c.getId() + "," +
                "\"complaintNumber\":\"" + ValidationUtil.escapeJson(c.getComplaintNumber()) + "\"," +
                "\"userId\":" + reportedUserId + "," +
                "\"studentUsername\":\"" + ValidationUtil.escapeJson(reporterDisplay) + "\"," +
                "\"studentFullName\":\"" + ValidationUtil.escapeJson(studentName) + "\"," +
                "\"categoryId\":" + c.getCategoryId() + "," +
                "\"categoryCode\":\"" + ValidationUtil.escapeJson(c.getCategoryCode()) + "\"," +
                "\"categoryName\":\"" + ValidationUtil.escapeJson(c.getCategoryName()) + "\"," +
                "\"categoryIcon\":\"" + ValidationUtil.escapeJson(c.getCategoryIcon()) + "\"," +
                "\"subCategory\":\"" + ValidationUtil.escapeJson(c.getSubCategory()) + "\"," +
                "\"hostelId\":" + (c.getHostelId() != null ? c.getHostelId() : "null") + "," +
                "\"hostelName\":\"" + ValidationUtil.escapeJson(c.getHostelName()) + "\"," +
                "\"facilityId\":" + (c.getFacilityId() != null ? c.getFacilityId() : "null") + "," +
                "\"facilityName\":\"" + ValidationUtil.escapeJson(c.getFacilityName()) + "\"," +
                "\"building\":\"" + ValidationUtil.escapeJson(c.getBuilding()) + "\"," +
                "\"roomNumber\":\"" + ValidationUtil.escapeJson(c.getRoomNumber()) + "\"," +
                "\"location\":\"" + ValidationUtil.escapeJson(c.getLocation()) + "\"," +
                "\"title\":\"" + ValidationUtil.escapeJson(c.getTitle()) + "\"," +
                "\"description\":\"" + ValidationUtil.escapeJson(c.getDescription()) + "\"," +
                "\"priority\":\"" + ValidationUtil.escapeJson(c.getPriority()) + "\"," +
                "\"status\":\"" + ValidationUtil.escapeJson(c.getStatus()) + "\"," +
                "\"isProtected\":" + isProt + "," +
                "\"visibility\":\"" + ValidationUtil.escapeJson(vis) + "\"," +
                "\"protectionReason\":\"" + ValidationUtil.escapeJson(c.getProtectionReason()) + "\"," +
                "\"assignedStaffId\":" + (c.getAssignedStaffId() != null ? c.getAssignedStaffId() : "null") + "," +
                "\"assignedStaffName\":\"" + ValidationUtil.escapeJson(c.getAssignedStaffName()) + "\"," +
                "\"assignedAt\":\"" + (c.getAssignedAt() != null ? c.getAssignedAt().toString() : "") + "\"," +
                "\"slaDeadline\":\"" + (c.getSlaDeadline() != null ? c.getSlaDeadline().toString() : "") + "\"," +
                "\"isOverdue\":" + c.isOverdue() + "," +
                "\"workStartedAt\":\"" + (c.getWorkStartedAt() != null ? c.getWorkStartedAt().toString() : "") + "\"," +
                "\"resolvedAt\":\"" + (c.getResolvedAt() != null ? c.getResolvedAt().toString() : "") + "\"," +
                "\"responseTimeSeconds\":" + (c.getResponseTimeSeconds() != null ? c.getResponseTimeSeconds() : "null") + "," +
                "\"resolutionTimeSeconds\":" + (c.getResolutionTimeSeconds() != null ? c.getResolutionTimeSeconds() : "null") + "," +
                "\"responseTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResponseTimeFormatted() != null ? c.getResponseTimeFormatted() : "N/A") + "\"," +
                "\"resolutionTimeFormatted\":\"" + ValidationUtil.escapeJson(c.getResolutionTimeFormatted() != null ? c.getResolutionTimeFormatted() : "N/A") + "\"," +
                "\"isResponseOverdue\":" + c.isResponseOverdue() + "," +
                "\"isResolutionOverdue\":" + c.isResolutionOverdue() + "," +
                "\"expectedResponseHours\":" + (c.getExpectedResponseHours() != null ? c.getExpectedResponseHours() : 6) + "," +
                "\"expectedResolutionHours\":" + (c.getExpectedResolutionHours() != null ? c.getExpectedResolutionHours() : 24) + "," +
                "\"overdueReason\":\"" + ValidationUtil.escapeJson(c.getOverdueReason() != null ? c.getOverdueReason() : "") + "\"," +
                "\"createdAt\":\"" + (c.getCreatedAt() != null ? c.getCreatedAt().toString() : "") + "\"," +
                "\"updatedAt\":\"" + (c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : "") + "\"" +
                "}";
    }

    private void handleStatusUpdate(HttpServletRequest request, HttpServletResponse response,
                                    HttpSession session, int userId, String role)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idParam = getFormField(request, "complaintId");
        if (idParam == null) idParam = getFormField(request, "id");
        String numParam = getFormField(request, "complaintNumber");
        String newStatus = getFormField(request, "newStatus");
        if (newStatus == null) newStatus = getFormField(request, "status");
        String remarks = getFormField(request, "remarks");

        if (newStatus == null || newStatus.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"newStatus parameter is required.\"}");
            return;
        }
        newStatus = newStatus.trim().toUpperCase();

        // 1. Validate status enum against 9 official statuses
        List<String> validStatuses = List.of(
                "SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS",
                "RESOLVED", "CLOSED", "REOPENED", "ESCALATED", "REJECTED"
        );
        if (!validStatuses.contains(newStatus)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid status value: " + ValidationUtil.escapeJson(newStatus) + "\"}");
            return;
        }

        // 2. Fetch target complaint
        Complaint complaint = null;
        if (ValidationUtil.isNotEmpty(numParam)) {
            complaint = complaintDAO.getComplaintByNumber(numParam.trim());
        } else if (ValidationUtil.isNotEmpty(idParam)) {
            try {
                complaint = complaintDAO.getComplaintById(Integer.parseInt(idParam.trim()));
            } catch (NumberFormatException ignored) {}
        }

        if (complaint == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Complaint not found.\"}");
            return;
        }

        // 3. RBAC Authorization: Only authorized users can modify status
        boolean authorized = false;
        String authError = "You are not authorized to update this status.";

        if ("ADMIN".equalsIgnoreCase(role)) {
            authorized = true;
        } else if ("STAFF".equalsIgnoreCase(role) || "MAINTENANCE_STAFF".equalsIgnoreCase(role)) {
            // Staff can transition to IN_PROGRESS or RESOLVED
            if ("IN_PROGRESS".equals(newStatus) || "RESOLVED".equals(newStatus)) {
                if (complaint.getAssignedStaffId() == null || complaint.getAssignedStaffId() == userId) {
                    authorized = true;
                } else {
                    authError = "Complaint is assigned to another staff technician.";
                }
            } else {
                authError = "Staff can only transition tickets to IN_PROGRESS or RESOLVED.";
            }
        } else if ("WARDEN".equalsIgnoreCase(role) || "DEPUTY_WARDEN".equalsIgnoreCase(role)) {
            if (List.of("UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "REJECTED", "RESOLVED").contains(newStatus)) {
                authorized = true;
            } else {
                authError = "Warden cannot transition tickets directly to " + newStatus + ".";
            }
        } else if ("HIGHER_AUTHORITY".equalsIgnoreCase(role)) {
            if (List.of("UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED").contains(newStatus)) {
                authorized = true;
            } else {
                authError = "Higher Authority cannot transition tickets to " + newStatus + ".";
            }
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            // Students can ONLY modify their own complaints
            boolean isOwner = (complaint.getUserId() == userId);
            if (!isOwner) {
                isOwner = complaintDAO.isProtectedComplaintOwner(complaint.getId(), userId);
            }
            if (!isOwner) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Access denied to another student's complaint.\"}");
                return;
            }
            // Students can ONLY transition to CLOSED or REOPENED
            if ("CLOSED".equals(newStatus) || "REOPENED".equals(newStatus)) {
                authorized = true;
            } else {
                authError = "Students can only mark resolved complaints as CLOSED or REOPENED.";
            }
        }

        if (!authorized) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"" + ValidationUtil.escapeJson(authError) + "\"}");
            return;
        }

        String oldStatus = complaint.getStatus();
        boolean success = complaintDAO.updateStatus(complaint.getId(), newStatus, remarks, userId);
        if (success) {
            out.write(String.format(
                    "{\"success\":true,\"complaintId\":%d,\"complaintNumber\":\"%s\",\"oldStatus\":\"%s\",\"newStatus\":\"%s\",\"message\":\"Status updated successfully to %s.\"}",
                    complaint.getId(),
                    ValidationUtil.escapeJson(complaint.getComplaintNumber()),
                    ValidationUtil.escapeJson(oldStatus != null ? oldStatus : "SUBMITTED"),
                    ValidationUtil.escapeJson(newStatus),
                    ValidationUtil.escapeJson(newStatus)
            ));
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update status in database.\"}");
        }
    }

    private String toJsonComplaintDetail(Complaint c, List<ComplaintStatusHistory> timeline, Map<String, Object> resolutionDetails, String viewerRole) {
        boolean isProt = c.isProtected() || "PROTECTED".equalsIgnoreCase(c.getVisibility());
        boolean maskForViewer = isProt && !"ADMIN".equals(viewerRole) && !"STUDENT".equals(viewerRole);

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"complaint\":").append(complaintToJsonObject(c, viewerRole)).append(",");
        sb.append("\"timeline\":").append(toJsonTimeline(timeline, maskForViewer)).append(",");
        sb.append("\"resolutionDetails\":{");
        if (resolutionDetails != null && !resolutionDetails.isEmpty()) {
            sb.append("\"resolutionRemarks\":\"").append(ValidationUtil.escapeJson((String) resolutionDetails.getOrDefault("resolutionRemarks", ""))).append("\",");
            sb.append("\"resolvedAt\":\"").append(ValidationUtil.escapeJson((String) resolutionDetails.getOrDefault("resolvedAt", ""))).append("\",");
            sb.append("\"resolvedByName\":\"").append(ValidationUtil.escapeJson((String) resolutionDetails.getOrDefault("resolvedByName", ""))).append("\",");
            sb.append("\"resolverRole\":\"").append(ValidationUtil.escapeJson((String) resolutionDetails.getOrDefault("resolverRole", ""))).append("\"");
        }
        sb.append("},");

        List<ComplaintEvidence> evidenceList = complaintDAO.getEvidenceByComplaintId(c.getId());
        sb.append("\"evidence\":[");
        for (int i = 0; i < evidenceList.size(); i++) {
            ComplaintEvidence ev = evidenceList.get(i);
            sb.append("{")
                    .append("\"id\":").append(ev.getId()).append(",")
                    .append("\"fileName\":\"").append(ValidationUtil.escapeJson(ev.getFileName())).append("\",")
                    .append("\"filePath\":\"").append(ValidationUtil.escapeJson(ev.getFilePath())).append("\",")
                    .append("\"fileType\":\"").append(ValidationUtil.escapeJson(ev.getFileType())).append("\",")
                    .append("\"fileSizeBytes\":").append(ev.getFileSizeBytes()).append(",")
                    .append("\"stage\":\"").append(ValidationUtil.escapeJson(ev.getStage())).append("\",")
                    .append("\"createdAt\":\"").append(ev.getCreatedAt() != null ? ev.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < evidenceList.size() - 1) sb.append(",");
        }
        sb.append("]");

        sb.append("}");
        return sb.toString();
    }

    private String toJsonTimeline(List<ComplaintStatusHistory> timeline, boolean maskForViewer) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < timeline.size(); i++) {
            ComplaintStatusHistory h = timeline.get(i);
            String actorName = h.getChangedByName();
            Integer actorId = h.getChangedBy();

            if (maskForViewer && (actorId == null || "SUBMITTED".equals(h.getNewStatus()) || "REOPENED".equals(h.getNewStatus()) || "CLOSED".equals(h.getNewStatus()))) {
                actorName = "Identity: 🔒 PROTECTED";
                actorId = null;
            } else if (actorName == null || actorName.trim().isEmpty()) {
                actorName = "System / Portal";
            }

            sb.append("{")
                    .append("\"id\":").append(h.getId()).append(",")
                    .append("\"complaintId\":").append(h.getComplaintId()).append(",")
                    .append("\"oldStatus\":").append(h.getOldStatus() != null ? "\"" + ValidationUtil.escapeJson(h.getOldStatus()) + "\"" : "null").append(",")
                    .append("\"newStatus\":\"").append(ValidationUtil.escapeJson(h.getNewStatus())).append("\",")
                    .append("\"status\":\"").append(ValidationUtil.escapeJson(h.getStatus())).append("\",")
                    .append("\"remarks\":\"").append(ValidationUtil.escapeJson(h.getRemarks())).append("\",")
                    .append("\"changedBy\":").append(actorId != null ? actorId : "null").append(",")
                    .append("\"changedByName\":\"").append(ValidationUtil.escapeJson(actorName)).append("\",")
                    .append("\"createdAt\":\"").append(h.getCreatedAt() != null ? h.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            if (i < timeline.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String getFormField(HttpServletRequest request, String name) {
        String val = request.getParameter(name);
        if (val != null) {
            return val;
        }
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().startsWith("multipart/")) {
            try {
                Part part = request.getPart(name);
                if (part != null) {
                    try (java.io.InputStream is = part.getInputStream()) {
                        byte[] bytes = is.readAllBytes();
                        return new String(bytes, java.nio.charset.StandardCharsets.UTF_8).trim();
                    }
                }
            } catch (Exception ignored) {}
        }
        return null;
    }
}
