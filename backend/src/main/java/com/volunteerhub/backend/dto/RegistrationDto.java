package com.volunteerhub.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RegistrationDto {
    private Long id;
    private Long eventId;
    private Long userId;
    private String status;
    private LocalDateTime registeredAt;
}
