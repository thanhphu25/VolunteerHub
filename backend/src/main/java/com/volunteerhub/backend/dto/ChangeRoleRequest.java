package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * role must be one of: volunteer, organizer, admin
 */
@Getter
@Setter
public class ChangeRoleRequest {
    @NotBlank
    @Pattern(regexp = "^(volunteer|organizer|admin)$", message = "role must be volunteer|organizer|admin")
    private String role;
}
