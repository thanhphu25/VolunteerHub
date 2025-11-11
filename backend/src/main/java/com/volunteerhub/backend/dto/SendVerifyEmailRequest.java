package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for sending verification email.
 * If 'email' is absent and caller is authenticated, server will use authenticated user's email.
 */
public class SendVerifyEmailRequest {

    @Email
    private String email;

    /**
     * Optional: frontend URL to include in the verification link (e.g. https://app.example.com/verify-email).
     * If absent, server uses a default placeholder.
     */
    private String frontendVerifyUrl;

    public SendVerifyEmailRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFrontendVerifyUrl() { return frontendVerifyUrl; }
    public void setFrontendVerifyUrl(String frontendVerifyUrl) { this.frontendVerifyUrl = frontendVerifyUrl; }
}
