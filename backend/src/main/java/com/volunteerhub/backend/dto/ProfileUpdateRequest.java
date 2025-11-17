package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {
    @NotBlank
    @Size(max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;

    @Size(max = 500)
    private String avatarUrl;

    @Email
    private String email; // optional, allow update if provided
}
