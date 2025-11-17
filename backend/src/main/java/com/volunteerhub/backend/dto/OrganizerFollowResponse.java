package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class OrganizerFollowResponse {
    private Long organizerId;
    private String organizerName;
    private String organizerEmail;
    private String organizerAvatar;
    private LocalDateTime followedAt;
}
