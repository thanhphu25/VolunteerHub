package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;

    /**
     * Optional: frontend URL to include in email link. If null, server uses default placeholder.
     */
    private String frontendResetUrl;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFrontendResetUrl() { return frontendResetUrl; }
    public void setFrontendResetUrl(String frontendResetUrl) { this.frontendResetUrl = frontendResetUrl; }
}
