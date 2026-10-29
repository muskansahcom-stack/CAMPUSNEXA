package com.campusnexa.model;

import java.sql.Timestamp;

public class Complaint {
    private int id;
    private String complaintNumber;
    private int userId;
    private String studentUsername;
    private String studentFullName;
    private int categoryId;
    private String categoryCode;
    private String categoryName;
    private String categoryIcon;
    private String subCategory;
    private Integer hostelId;
    private String hostelName;
    private Integer facilityId;
    private String facilityName;
    private String building;
    private String roomNumber;
    private String location;
    private String title;
    private String description;
    private String priority;
    private String status;
    private boolean isProtected;
    private String protectionReason;
    private String visibility = "STANDARD";
    private Integer assignedStaffId;
    private String assignedStaffName;
    private Integer assignedBy;
    private Timestamp assignedAt;
    private Timestamp workStartedAt;
    private Timestamp resolvedAt;
    private Timestamp closedAt;
    private Timestamp slaDeadline;
    private boolean isOverdue;
    private Long responseTimeSeconds;
    private Long resolutionTimeSeconds;
    private String responseTimeFormatted;
    private String resolutionTimeFormatted;
    private boolean isResponseOverdue;
    private boolean isResolutionOverdue;
    private Integer expectedResponseHours;
    private Integer expectedResolutionHours;
    private String overdueReason;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Complaint() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentFullName() { return studentFullName; }
    public void setStudentFullName(String studentFullName) { this.studentFullName = studentFullName; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public Integer getHostelId() { return hostelId; }
    public void setHostelId(Integer hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public Integer getFacilityId() { return facilityId; }
    public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isProtected() { return isProtected; }
    public void setProtected(boolean isProtected) { this.isProtected = isProtected; }

    public String getProtectionReason() { return protectionReason; }
    public void setProtectionReason(String protectionReason) { this.protectionReason = protectionReason; }

    public Integer getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Integer assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public Integer getAssignedBy() { return assignedBy; }
    public void setAssignedBy(Integer assignedBy) { this.assignedBy = assignedBy; }

    public Timestamp getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Timestamp assignedAt) { this.assignedAt = assignedAt; }

    public Timestamp getWorkStartedAt() { return workStartedAt; }
    public void setWorkStartedAt(Timestamp workStartedAt) { this.workStartedAt = workStartedAt; }

    public Timestamp getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Timestamp resolvedAt) { this.resolvedAt = resolvedAt; }

    public Timestamp getClosedAt() { return closedAt; }
    public void setClosedAt(Timestamp closedAt) { this.closedAt = closedAt; }

    public Timestamp getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(Timestamp slaDeadline) { this.slaDeadline = slaDeadline; }

    public boolean isOverdue() { return isOverdue; }
    public void setOverdue(boolean isOverdue) { this.isOverdue = isOverdue; }

    public Long getResponseTimeSeconds() { return responseTimeSeconds; }
    public void setResponseTimeSeconds(Long responseTimeSeconds) { this.responseTimeSeconds = responseTimeSeconds; }

    public Long getResolutionTimeSeconds() { return resolutionTimeSeconds; }
    public void setResolutionTimeSeconds(Long resolutionTimeSeconds) { this.resolutionTimeSeconds = resolutionTimeSeconds; }

    public String getResponseTimeFormatted() { return responseTimeFormatted; }
    public void setResponseTimeFormatted(String responseTimeFormatted) { this.responseTimeFormatted = responseTimeFormatted; }

    public String getResolutionTimeFormatted() { return resolutionTimeFormatted; }
    public void setResolutionTimeFormatted(String resolutionTimeFormatted) { this.resolutionTimeFormatted = resolutionTimeFormatted; }

    public boolean isResponseOverdue() { return isResponseOverdue; }
    public void setResponseOverdue(boolean responseOverdue) { isResponseOverdue = responseOverdue; }

    public boolean isResolutionOverdue() { return isResolutionOverdue; }
    public void setResolutionOverdue(boolean resolutionOverdue) { isResolutionOverdue = resolutionOverdue; }

    public Integer getExpectedResponseHours() { return expectedResponseHours; }
    public void setExpectedResponseHours(Integer expectedResponseHours) { this.expectedResponseHours = expectedResponseHours; }

    public Integer getExpectedResolutionHours() { return expectedResolutionHours; }
    public void setExpectedResolutionHours(Integer expectedResolutionHours) { this.expectedResolutionHours = expectedResolutionHours; }

    public String getOverdueReason() { return overdueReason; }
    public void setOverdueReason(String overdueReason) { this.overdueReason = overdueReason; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}
