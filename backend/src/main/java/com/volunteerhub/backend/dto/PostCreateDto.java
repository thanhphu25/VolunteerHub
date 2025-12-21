package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for creating a new post.
 * This class captures the content and associations (user and event) required 
 * to publish a post in the event's discussion feed.
 */
public class PostCreateDto {

    /**
     * The main textual content of the post.
     * Restricted to 2000 characters to ensure concise community updates 
     * and efficient database storage.
     */
    @NotBlank
    @Size(max = 2000)
    private String content;

    /** The ID of the event under which this post is being published. */
    private Long eventId;

    /** The ID of the user who is creating the post. */
    private Long userId;

    /** Optional URL for an image attached to the post. */
    private String imageUrl;

    /**
     * Default no-args constructor for JSON deserialization.
     */
    public PostCreateDto() {
    }

    /**
     * Gets the post content.
     * @return the content string.
     */
    public String getContent() {
        return content;
    }

    /**
     * Sets the post content.
     * @param content the textual content of the post.
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Gets the associated event ID.
     * @return the event unique identifier.
     */
    public Long getEventId() {
        return eventId;
    }

    /**
     * Sets the associated event ID.
     * @param eventId the event unique identifier.
     */
    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    /**
     * Gets the creator's user ID.
     * @return the user unique identifier.
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the creator's user ID.
     * @param userId the user unique identifier.
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Gets the attached image URL.
     * @return the image URL string.
     */
    public String getImageUrl() {
        return imageUrl;
    }

    /**
     * Sets the attached image URL.
     * @param imageUrl the image URL string.
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}