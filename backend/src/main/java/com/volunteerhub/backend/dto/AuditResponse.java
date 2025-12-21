package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing an audit log entry.
 * This class is used to provide administrators with a detailed history of 
 * system actions, including who performed the action and when.
 */
public class AuditResponse {

    /** The unique identifier of the audit log entry. */
    private Long id;

    /** The ID of the user who performed the action. */
    private Long userId;

    /** The email address of the user who performed the action (for easier identification). */
    private String userEmail;

    /** The name or code of the action performed (e.g., "admin:lock_user"). */
    private String action;

    /** Additional technical or descriptive details about the action in JSON or text format. */
    private String details;

    /** The timestamp indicating when the action was recorded. */
    private LocalDateTime createdAt;

    /**
     * Default no-args constructor for JSON serialization and deserialization.
     */
    public AuditResponse() {
    }

    /**
     * All-args constructor for quick instantiation.
     * * @param id The log ID.
     * @param userId The ID of the actor.
     * @param userEmail The email of the actor.
     * @param action The specific activity performed.
     * @param details Metadata about the activity.
     * @param createdAt The time of the event.
     */
    public AuditResponse(Long id, Long userId, String userEmail, String action, String details,
            LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.action = action;
        this.details = details;
        this.createdAt = createdAt;
    }

    /**
     * Gets the audit entry ID.
     * @return the unique ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the audit entry ID.
     * @param id the unique ID.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the ID of the user who triggered the event.
     * @return the user ID.
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the ID of the user who triggered the event.
     * @param userId the user ID.
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Gets the email of the user who triggered the event.
     * @return the user email string.
     */
    public String getUserEmail() {
        return userEmail;
    }

    /**
     * Sets the email of the user who triggered the event.
     * @param userEmail the user email string.
     */
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    /**
     * Gets the action descriptor.
     * @return the action string.
     */
    public String getAction() {
        return action;
    }

    /**
     * Sets the action descriptor.
     * @param action the action string.
     */
    public void setAction(String action) {
        this.action = action;
    }

    /**
     * Gets the action metadata/details.
     * @return the details string.
     */
    public String getDetails() {
        return details;
    }

    /**
     * Sets the action metadata/details.
     * @param details the details string.
     */
    public void setDetails(String details) {
        this.details = details;
    }

    /**
     * Gets the creation timestamp.
     * @return the LocalDateTime of creation.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp.
     * @param createdAt the LocalDateTime of creation.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}