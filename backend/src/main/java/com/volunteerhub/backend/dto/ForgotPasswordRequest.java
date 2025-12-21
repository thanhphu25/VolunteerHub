package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for initiating a password reset request.
 * This DTO captures the user's identity and the destination for the recovery link
 * to facilitate the "Forgot Password" workflow.
 */
public class ForgotPasswordRequest {

    /**
     * The email address associated with the user account that needs a password reset.
     * Must be a valid email format and cannot be empty.
     */
    @NotBlank
    @Email
    private String email;

    /**
     * The base URL of the frontend application where the user will be redirected 
     * to set their new password. This allows the backend to generate a 
     * platform-specific reset link.
     */
    private String frontendResetUrl;

    /**
     * Gets the user's registered email address.
     * @return the email address string.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the user's registered email address.
     * @param email the email address to search for in the database.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the frontend reset redirection URL.
     * @return the base URL for the password reset page.
     */
    public String getFrontendResetUrl() {
        return frontendResetUrl;
    }

    /**
     * Sets the frontend reset redirection URL.
     * @param frontendResetUrl the URL provided by the client application.
     */
    public void setFrontendResetUrl(String frontendResetUrl) {
        this.frontendResetUrl = frontendResetUrl;
    }
}