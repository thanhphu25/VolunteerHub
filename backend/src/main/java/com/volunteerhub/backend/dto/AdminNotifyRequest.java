package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for administrator-initiated notification requests.
 * Used to capture the necessary details to send system-internal or push notifications to a specific user.
 */
public class AdminNotifyRequest {

    /** The unique identifier of the recipient user. */
    @NotNull
    private Long userId;

    /** The short summary or heading of the notification. */
    @NotBlank
    private String title;

    /** The detailed content or body of the notification message. */
    @NotBlank
    private String message;

    /** An optional URL or internal app link to be opened when the notification is clicked. */
    private String link;

    /** The category of notification (e.g., "admin", "system", "event_update"). */
    private String type;

    /**
     * Default no-args constructor for JSON deserialization.
     */
    public AdminNotifyRequest() {
    }

    /**
     * Gets the target user's ID.
     * @return the user ID.
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the target user's ID.
     * @param userId the unique identifier of the user.
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Gets the notification title.
     * @return the title string.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the notification title.
     * @param title the title text.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Gets the notification message body.
     * @return the message string.
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the notification message body.
     * @param message the full message text.
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Gets the associated action link.
     * @return the link URL or path.
     */
    public String getLink() {
        return link;
    }

    /**
     * Sets the associated action link.
     * @param link the URL or internal path.
     */
    public void setLink(String link) {
        this.link = link;
    }

    /**
     * Gets the notification type category.
     * @return the type identifier.
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the notification type category.
     * @param type the type identifier (e.g., admin).
     */
    public void setType(String type) {
        this.type = type;
    }
}