package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO used when creating a post (without file). Controller will set eventId/userId/imageUrl as needed.
 */
public class PostCreateDto {

    @NotBlank
    @Size(max = 2000)
    private String content;

    // eventId and userId populated by controller, not by client (path/auth)
    private Long eventId;
    private Long userId;

    // imageUrl set when file uploaded
    private String imageUrl;

    public PostCreateDto() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
