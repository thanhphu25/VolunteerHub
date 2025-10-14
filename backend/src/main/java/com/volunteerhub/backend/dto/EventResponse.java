package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

public class EventResponse {
    private Long id;
    private Long organizerId;
    private String name;
    private String slug;
    private String description;
    private String category;
    private String location;
    private String address;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxVolunteers;
    private Integer currentVolunteers;
    private String status;
    private String imageUrl;
    private String requirements;
    private String benefits;
    private String contactInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private Long approvedBy;

    public EventResponse() {}

    public EventResponse(Long id, Long organizerId, String name, String slug, String description, String category, String location, String address, LocalDateTime startDate, LocalDateTime endDate, Integer maxVolunteers, Integer currentVolunteers, String status, String imageUrl, String requirements, String benefits, String contactInfo, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime approvedAt, Long approvedBy) {
        this.id = id;
        this.organizerId = organizerId;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.category = category;
        this.location = location;
        this.address = address;
        this.startDate = startDate;
        this.endDate = endDate;
        this.maxVolunteers = maxVolunteers;
        this.currentVolunteers = currentVolunteers;
        this.status = status;
        this.imageUrl = imageUrl;
        this.requirements = requirements;
        this.benefits = benefits;
        this.contactInfo = contactInfo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.approvedAt = approvedAt;
        this.approvedBy = approvedBy;
    }

    // getters & setters omitted for brevity — add as needed or generate in IDE
    // (If you want, I can paste all getters/setters — but they are standard.)
    public Long getId() { return id; }
    public Long getOrganizerId() { return organizerId; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getAddress() { return address; }
    public java.time.LocalDateTime getStartDate() { return startDate; }
    public java.time.LocalDateTime getEndDate() { return endDate; }
    public Integer getMaxVolunteers() { return maxVolunteers; }
    public Integer getCurrentVolunteers() { return currentVolunteers; }
    public String getStatus() { return status; }
    public String getImageUrl() { return imageUrl; }
    public String getRequirements() { return requirements; }
    public String getBenefits() { return benefits; }
    public String getContactInfo() { return contactInfo; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public java.time.LocalDateTime getApprovedAt() { return approvedAt; }
    public Long getApprovedBy() { return approvedBy; }
}
