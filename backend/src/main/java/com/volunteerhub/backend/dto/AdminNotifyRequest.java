package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminNotifyRequest {
    @NotNull
    private Long userId;
    @NotBlank
    private String title;
    @NotBlank
    private String message;
    private String link;
    private String type; // optional

    public AdminNotifyRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
