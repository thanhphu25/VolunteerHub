package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for new user registration.
 * This class captures the required information to create a new account,
 * enforcing security constraints on passwords and validating the user's initial role.
 */
@Getter
@Setter
public class RegisterRequest {

    /**
     * The unique email address for the new account.
     * Must follow a valid email format and cannot be empty.
     */
    @Email
    @NotBlank
    private String email;

    /**
     * The plain-text password chosen by the user.
     * Enforced length of 6 to 128 characters to ensure a balance between 
     * security and user memorability.
     */
    @NotBlank
    @Size(min = 6, max = 128)
    private String password;

    /**
     * The full display name of the user.
     * Restricted to 255 characters for database compatibility.
     */
    @NotBlank
    @Size(max = 255)
    private String fullName;

    /**
     * The contact phone number of the user.
     * Restricted to 50 characters to support international formats.
     */
    @Size(max = 50)
    private String phone;

    /**
     * The initial role requested by the user.
     * Defaults to 'volunteer' if not specified, but can be explicitly set 
     * to 'organizer'. Validated via regex to prevent invalid role assignments.
     */
    @Pattern(regexp = "^(volunteer|organizer)?$", message = "role must be 'volunteer' or 'organizer' (optional)")
    private String role;
}