package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for requesting a user role update.
 * This DTO is primarily used by administrators to change the access level 
 * of an existing user within the system.
 */
@Getter
@Setter
public class ChangeRoleRequest {

    /** * The new role to be assigned to the user.
     * Must be one of the pre-defined roles: volunteer, organizer, or admin.
     * Case-sensitive and validated via regex pattern.
     */
    @NotBlank
    @Pattern(regexp = "^(volunteer|organizer|admin)$", message = "role must be volunteer|organizer|admin")
    private String role;
}