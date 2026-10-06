package com.campusnexa.model;

import java.sql.Timestamp;

/**
 * Model representing complaint evidence files (photographs, inspection notes, documents).
 */
public class ComplaintEvidence {
    private int id;
    private int complaintId;
    private String fileName;
    private String filePath;
    private String fileType;
    private long fileSizeBytes;
    private String stage; // SUBMISSION, INSPECTION, RESOLUTION
    private int uploadedBy;
    private Timestamp createdAt;

    public ComplaintEvidence() {}

    public ComplaintEvidence(int id, int complaintId, String fileName, String filePath,
                             String fileType, long fileSizeBytes, String stage, int uploadedBy, Timestamp createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSizeBytes = fileSizeBytes;
        this.stage = stage;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public int getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(int uploadedBy) { this.uploadedBy = uploadedBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
