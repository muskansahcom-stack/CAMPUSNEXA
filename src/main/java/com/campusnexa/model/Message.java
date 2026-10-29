package com.campusnexa.model;

import java.sql.Timestamp;

public class Message {
    private int id;
    private int complaintId;
    private String complaintNumber;
    private int senderId;
    private String senderName;
    private Integer recipientId;
    private String recipientName;
    private String senderRole;
    private String receiverRole;
    private String messageText;
    private String message;
    private boolean isProtectedSender;
    private boolean isRead;
    private boolean readStatus;
    private Timestamp createdAt;

    public Message() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Integer getRecipientId() { return recipientId; }
    public void setRecipientId(Integer recipientId) { this.recipientId = recipientId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getReceiverRole() { return receiverRole; }
    public void setReceiverRole(String receiverRole) { this.receiverRole = receiverRole; }

    public String getMessageText() { return messageText != null ? messageText : message; }
    public void setMessageText(String messageText) { 
        this.messageText = messageText; 
        this.message = messageText;
    }

    public String getMessage() { return message != null ? message : messageText; }
    public void setMessage(String message) { 
        this.message = message; 
        this.messageText = message;
    }

    public boolean isProtectedSender() { return isProtectedSender; }
    public void setProtectedSender(boolean protectedSender) { isProtectedSender = protectedSender; }

    public boolean isRead() { return isRead || readStatus; }
    public void setRead(boolean read) { 
        this.isRead = read; 
        this.readStatus = read;
    }

    public boolean isReadStatus() { return readStatus || isRead; }
    public void setReadStatus(boolean readStatus) { 
        this.readStatus = readStatus; 
        this.isRead = readStatus;
    }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
