package com.volunteerhub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    private Long id;
    private String type;
    private String category;
    private String title;
    private String message;
    private String payload; // raw json string
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Map<String, Object> meta;
}
