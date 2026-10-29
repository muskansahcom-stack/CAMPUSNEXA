package com.campusnexa.model;

import java.sql.Timestamp;

public class Facility {
    private int id;
    private String name;
    private String locationDetails;
    private String inChargeName;
    private Timestamp createdAt;

    public Facility() {}

    public Facility(int id, String name, String locationDetails, String inChargeName) {
        this.id = id;
        this.name = name;
        this.locationDetails = locationDetails;
        this.inChargeName = inChargeName;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocationDetails() { return locationDetails; }
    public void setLocationDetails(String locationDetails) { this.locationDetails = locationDetails; }

    public String getInChargeName() { return inChargeName; }
    public void setInChargeName(String inChargeName) { this.inChargeName = inChargeName; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
