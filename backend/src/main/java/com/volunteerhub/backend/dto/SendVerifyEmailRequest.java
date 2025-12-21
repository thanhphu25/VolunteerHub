package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for requesting a verification email.
 * This DTO is used to initiate the account verification process by sending 
 * a secure link to the user's registered email address.
 */
public class SendVerifyEmailRequest {

    /**
     * The email address to which the verification link will be sent.
     * Must be a valid email format.
     */
    @Email
    private String email;

    /**
     * The base URL of the frontend application where the user will be redirected 
     * after clicking the verification link in their email. This allows the 
     * backend to construct a valid redirection URL.
     */
    private String frontendVerifyUrl;

    /**
     * Default no-args constructor for JSON deserialization.
     */
    public SendVerifyEmailRequest() {
    }

    /**
     * Gets the recipient email address.
     * @return the email address string.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the recipient email address.
     * @param email the email address to verify.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the frontend verification redirection URL.
     * @return the base URL for the verification landing page.
     */
    public String getFrontendVerifyUrl() {
        return frontendVerifyUrl;
    }

    /**
     * Sets the frontend verification redirection URL.
     * @param frontendVerifyUrl the URL provided by the client application.
     */
    public void setFrontendVerifyUrl(String frontendVerifyUrl) {
        this.frontendVerifyUrl = frontendVerifyUrl;
    }
}