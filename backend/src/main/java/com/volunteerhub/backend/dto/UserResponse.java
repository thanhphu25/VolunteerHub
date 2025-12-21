package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a user's account information.
 * This response is used across the system to display user profiles, 
 * administrative lists, and current session details.
 */
@Getter
@Setter
@AllArgsConstructor
public class UserResponse {

    /** The unique identifier of the user record. */
    private Long id;

    /** The registered email address of the user. */
    private String email;

    /** The full display name of the user. */
    private String fullName;

    /** The contact phone number associated with the account. */
    private String phone;

    /** * The system role assigned to the user.
     * e.g., "ROLE_VOLUNTEER", "ROLE_ORGANIZER", "ROLE_ADMIN".
     */
    private String role;

    /** * The current account status.
     * e.g., "ACTIVE", "PENDING_VERIFICATION", "SUSPENDED".
     */
    private String status;

    /** The timestamp indicating when the account was first created. */
    private LocalDateTime createdAt;

    /** The timestamp of the user's most recent successful authentication. */
    private LocalDateTime lastLogin;
}