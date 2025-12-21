package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for updating user profile information.
 * This class captures the modifiable fields of a user's account, allowing 
 * them to update their display name, contact information, and avatar.
 */
@Getter
@Setter
public class ProfileUpdateRequest {

    /**
     * The updated full name of the user.
     * Must not be blank and is restricted to 255 characters.
     */
    @NotBlank
    @Size(max = 255)
    private String fullName;

    /**
     * The updated contact phone number.
     * Restricted to 50 characters to accommodate various international formats.
     */
    @Size(max = 50)
    private String phone;

    /**
     * The updated URL for the user's profile picture.
     * Limited to 500 characters to prevent excessively long URI strings.
     */
    @Size(max = 500)
    private String avatarUrl;

    /**
     * The updated email address.
     * Must follow a valid email format if provided.
     */
    @Email
    private String email;
}