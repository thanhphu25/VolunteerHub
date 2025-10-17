package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
