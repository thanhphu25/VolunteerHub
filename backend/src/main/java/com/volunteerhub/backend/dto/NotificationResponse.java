package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String payload; // raw json string
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
