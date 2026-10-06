package com.campusnexa.model;

import java.sql.Timestamp;

public class ComplaintStatusHistory {
    private int id;
    private int complaintId;
    private String oldStatus;
    private String newStatus;
    private String status;
    private String remarks;
    private Integer changedBy;
    private String changedByName;
    private Timestamp createdAt;

    public ComplaintStatusHistory() {}

    public ComplaintStatusHistory(int id, int complaintId, String status, String remarks, Integer changedBy, String changedByName, Timestamp createdAt) {
        this(id, complaintId, null, status, status, remarks, changedBy, changedByName, createdAt);
    }

    public ComplaintStatusHistory(int id, int complaintId, String oldStatus, String newStatus, String status, String remarks, Integer changedBy, String changedByName, Timestamp createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus != null ? newStatus : status;
        this.status = this.newStatus;
        this.remarks = remarks;
        this.changedBy = changedBy;
        this.changedByName = changedByName;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

    public String getOldStatus() { return oldStatus; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }

    public String getNewStatus() { return newStatus != null ? newStatus : status; }
    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
        this.status = newStatus;
    }

    public String getStatus() { return getNewStatus(); }
    public void setStatus(String status) {
        this.status = status;
        if (this.newStatus == null) {
            this.newStatus = status;
        }
    }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Integer getChangedBy() { return changedBy; }
    public void setChangedBy(Integer changedBy) { this.changedBy = changedBy; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
