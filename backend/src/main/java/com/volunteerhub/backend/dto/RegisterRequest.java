package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Payload for /api/auth/register
 * - role: optional, allowed values "volunteer" or "organizer"
 */
@Getter
@Setter
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 128)
    private String password;

    @NotBlank
    @Size(max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;

    /**
     * Optional: "volunteer" or "organizer"
     * If null/blank -> default to "volunteer"
     */
    @Pattern(regexp = "^(volunteer|organizer)?$", message = "role must be 'volunteer' or 'organizer' (optional)")
    private String role;
}
