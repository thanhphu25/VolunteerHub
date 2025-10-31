package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO trả về audit log cho client.
 */
public class AuditResponse {
    private Long id;
    private Long userId;         // actor user id (nullable)
    private String userEmail;    // actor user email (nullable)
    private String action;
    private String details;      // raw JSON string (nullable)
    private LocalDateTime createdAt;

    public AuditResponse() {}

    public AuditResponse(Long id, Long userId, String userEmail, String action, String details, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.action = action;
        this.details = details;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
