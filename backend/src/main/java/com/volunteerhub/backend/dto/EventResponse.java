package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Comprehensive Data Transfer Object representing a volunteer event.
 * This object is used to return detailed event data to the frontend, including 
 * participation metrics, administrative status, and activity tracking.
 */
@Getter
@Setter
@AllArgsConstructor
public class EventResponse {

    /** The unique identifier of the event. */
    private Long id;

    /** The ID of the user (organizer) who created the event. */
    private Long organizerId;

    /** The full name of the organizer for display purposes. */
    private String organizerName;

    /** The name or title of the event. */
    private String name;

    /** A URL-friendly version of the event name used for routing. */
    private String slug;

    /** Detailed information about the event's activities and mission. */
    private String description;

    /** The thematic category of the event (e.g., Environment, Education). */
    private String category;

    /** The general city or region of the event. */
    private String location;

    /** The exact physical address where the event takes place. */
    private String address;

    /** The timestamp for the start of the event. */
    private LocalDateTime startDate;

    /** The timestamp for the end of the event. */
    private LocalDateTime endDate;

    /** The capacity limit for volunteer registrations. */
    private Integer maxVolunteers;

    /** The current number of volunteers with an 'approved' registration status. */
    private Integer currentVolunteers;

    /** The current lifecycle status (e.g., pending, approved, rejected, cancelled). */
    private String status;

    /** URL path to the event's promotional image. */
    private String imageUrl;

    /** Qualifications or specific skills expected from participants. */
    private String requirements;

    /** Rewards, certifications, or perks offered to volunteers. */
    private String benefits;

    /** Direct contact details for the event coordinator. */
    private String contactInfo;

    /** The timestamp when the event was first created. */
    private LocalDateTime createdAt;

    /** The timestamp of the most recent update to the event details. */
    private LocalDateTime updatedAt;

    /** The timestamp when an administrator approved this event. */
    private LocalDateTime approvedAt;

    /** The User ID of the administrator who granted approval. */
    private Long approvedBy;

    /** Timestamp of the most recent interaction (e.g., new post, new registration). */
    private LocalDateTime lastActivityAt;

    /** Descriptor of the most recent interaction (e.g., "new_post", "registration"). */
    private String lastActivityType;
}