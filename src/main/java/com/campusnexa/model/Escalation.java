package com.campusnexa.model;

import java.sql.Timestamp;

public class Escalation {
    private int id;
    private String escalationNumber;
    private int complaintId;
    private String complaintNumber;
    private String complaintTitle;
    private int escalatedBy;
    private Integer raisedBy;
    private String escalatedByName;
    private String fromAuthority = "DEPUTY_WARDEN";
    private String toAuthority = "HIGHER_AUTHORITY";
    private String escalationType;
    private String reason;
    private String status;
    private String remarks;
    private Timestamp responseDeadline;
    private String actionTaken;
    private Integer actionBy;
    private String actionByName;
    private Timestamp actionAt;
    private Timestamp resolvedAt;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Escalation() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEscalationNumber() { return escalationNumber; }
    public void setEscalationNumber(String escalationNumber) { this.escalationNumber = escalationNumber; }

    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

    public String getComplaintTitle() { return complaintTitle; }
    public void setComplaintTitle(String complaintTitle) { this.complaintTitle = complaintTitle; }

    public int getEscalatedBy() { return escalatedBy > 0 ? escalatedBy : (raisedBy != null ? raisedBy : 0); }
    public void setEscalatedBy(int escalatedBy) { 
        this.escalatedBy = escalatedBy; 
        this.raisedBy = escalatedBy;
    }

    public Integer getRaisedBy() { return raisedBy != null ? raisedBy : escalatedBy; }
    public void setRaisedBy(Integer raisedBy) { 
        this.raisedBy = raisedBy; 
        if (raisedBy != null) this.escalatedBy = raisedBy;
    }

    public String getEscalatedByName() { return escalatedByName; }
    public void setEscalatedByName(String escalatedByName) { this.escalatedByName = escalatedByName; }

    public String getFromAuthority() { return fromAuthority != null ? fromAuthority : "DEPUTY_WARDEN"; }
    public void setFromAuthority(String fromAuthority) { this.fromAuthority = fromAuthority; }

    public String getToAuthority() { return toAuthority != null ? toAuthority : "HIGHER_AUTHORITY"; }
    public void setToAuthority(String toAuthority) { this.toAuthority = toAuthority; }

    public String getEscalationType() { return escalationType; }
    public void setEscalationType(String escalationType) { this.escalationType = escalationType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks != null ? remarks : actionTaken; }
    public void setRemarks(String remarks) { 
        this.remarks = remarks; 
        if (this.actionTaken == null) this.actionTaken = remarks;
    }

    public Timestamp getResponseDeadline() { return responseDeadline; }
    public void setResponseDeadline(Timestamp responseDeadline) { this.responseDeadline = responseDeadline; }

    public String getActionTaken() { return actionTaken != null ? actionTaken : remarks; }
    public void setActionTaken(String actionTaken) { 
        this.actionTaken = actionTaken; 
        this.remarks = actionTaken;
    }

    public Integer getActionBy() { return actionBy; }
    public void setActionBy(Integer actionBy) { this.actionBy = actionBy; }

    public String getActionByName() { return actionByName; }
    public void setActionByName(String actionByName) { this.actionByName = actionByName; }

    public Timestamp getActionAt() { return actionAt; }
    public void setActionAt(Timestamp actionAt) { this.actionAt = actionAt; }

    public Timestamp getResolvedAt() { return resolvedAt != null ? resolvedAt : actionAt; }
    public void setResolvedAt(Timestamp resolvedAt) { this.resolvedAt = resolvedAt; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
