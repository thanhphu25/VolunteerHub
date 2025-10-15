package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private Long organizerId;
    private String organizerName;
    private String name;
    private String slug;
    private String description;
    private String category;
    private String location;
    private String address;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxVolunteers;
    private Integer currentVolunteers;
    private String status;
    private String imageUrl;
    private String requirements;
    private String benefits;
    private String contactInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private Long approvedBy;
}
