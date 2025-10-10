package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RegistrationRequest {
    @NotNull(message = "userId is required")
    private Long userId;

    public RegistrationRequest() {}
    public RegistrationRequest(Long userId) { this.userId = userId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
