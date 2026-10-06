package com.campusnexa.model;

import java.sql.Timestamp;

public class Category {
    private int id;
    private String code;
    private String name;
    private String icon;
    private int defaultSlaHours;
    private String description;
    private Timestamp createdAt;

    public Category() {}

    public Category(int id, String code, String name, String icon, int defaultSlaHours, String description) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.icon = icon;
        this.defaultSlaHours = defaultSlaHours;
        this.description = description;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getDefaultSlaHours() { return defaultSlaHours; }
    public void setDefaultSlaHours(int defaultSlaHours) { this.defaultSlaHours = defaultSlaHours; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
