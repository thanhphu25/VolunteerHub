package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventCreateRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    private String description;

    @NotBlank
    @Size(max = 100)
    private String category;

    @NotBlank
    @Size(max = 500)
    private String location;

    private String address;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    private Integer maxVolunteers;

    private String imageUrl;

    private String requirements;

    private String benefits;

    private String contactInfo;
}
