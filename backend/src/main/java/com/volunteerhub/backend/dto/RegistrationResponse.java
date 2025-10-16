package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventName;
    private Long volunteerId;
    private String volunteerName;
    private String status;
    private String note;
    private String organizerNote;
    private String attendanceStatus;
    private String completionNote;
    private LocalDateTime registeredAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
}
