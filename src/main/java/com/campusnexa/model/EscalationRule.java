package com.campusnexa.model;

import java.sql.Timestamp;

/**
 * Model representing an institutional Escalation / SLA Rule.
 * Configured by Administrator for system response and resolution monitoring.
 *
 * NOTE: These benchmarks are operational monitoring targets and do not claim to be official college policies.
 */
public class EscalationRule {
    private int id;
    private String categoryName;
    private String ruleType = "CATEGORY"; // "CATEGORY" or "PRIORITY"
    private int expectedResponseHours;
    private int expectedResolutionHours;
    private String priorityLevel;
    private String description;
    private String policyDisclaimer = "Operational monitoring benchmark configured by administrator for system monitoring. Not official college policy.";
    private boolean active = true;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public EscalationRule() {}

    public EscalationRule(int id, String categoryName, String ruleType, int expectedResponseHours,
                          int expectedResolutionHours, String priorityLevel, String description,
                          String policyDisclaimer, boolean active, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.categoryName = categoryName;
        this.ruleType = ruleType;
        this.expectedResponseHours = expectedResponseHours;
        this.expectedResolutionHours = expectedResolutionHours;
        this.priorityLevel = priorityLevel;
        this.description = description;
        this.policyDisclaimer = policyDisclaimer != null ? policyDisclaimer : this.policyDisclaimer;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getRuleType() { return ruleType; }
    public void setRuleType(String ruleType) { this.ruleType = ruleType; }

    public int getExpectedResponseHours() { return expectedResponseHours; }
    public void setExpectedResponseHours(int expectedResponseHours) { this.expectedResponseHours = expectedResponseHours; }

    public int getExpectedResolutionHours() { return expectedResolutionHours; }
    public void setExpectedResolutionHours(int expectedResolutionHours) { this.expectedResolutionHours = expectedResolutionHours; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPolicyDisclaimer() { return policyDisclaimer; }
    public void setPolicyDisclaimer(String policyDisclaimer) { this.policyDisclaimer = policyDisclaimer; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
