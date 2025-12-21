package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for user authentication.
 * This DTO captures the credentials provided by the user during the login process
 * and includes basic validation to ensure the email format is correct.
 */
@Getter
@Setter
public class LoginRequest {

    /**
     * The registered email address of the user.
     * Must be a valid email format and cannot be blank.
     */
    @Email
    @NotBlank
    private String email;

    /**
     * The plain-text password provided by the user.
     * This will be matched against the hashed password stored in the database
     * by the AuthenticationManager.
     */
    @NotBlank
    private String password;
}