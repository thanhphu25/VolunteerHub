package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for creating or updating a volunteer event.
 * Contains the core details required to define an event, including its 
 * schedule, location, and participation limits.
 */
@Getter
@Setter
public class EventCreateRequest {

    /** * The name or title of the event.
     * Must not be blank and is limited to 255 characters.
     */
    @NotBlank
    @Size(max = 255)
    private String name;

    /** * A detailed description of the event's goals and activities.
     */
    @NotBlank
    private String description;

    /** * The category of the event (e.g., "Environment", "Education", "Healthcare").
     */
    @NotBlank
    @Size(max = 100)
    private String category;

    /** * The general location or city where the event takes place.
     */
    @NotBlank
    @Size(max = 500)
    private String location;

    /** * The specific physical address of the event venue.
     */
    private String address;

    /** * The date and time when the event is scheduled to begin.
     */
    @NotNull
    private LocalDateTime startDate;

    /** * The date and time when the event is scheduled to conclude.
     */
    @NotNull
    private LocalDateTime endDate;

    /** * The maximum number of volunteers allowed to register for this event.
     * If null, the event may be considered to have unlimited capacity.
     */
    private Integer maxVolunteers;

    /** * URL to a promotional or informative image for the event.
     */
    private String imageUrl;

    /** * Specific skills or qualifications required from the volunteers.
     */
    private String requirements;

    /** * Perks or benefits provided to volunteers (e.g., "Certificate", "Lunch").
     */
    private String benefits;

    /** * Information on how to reach the organizer for queries (email, phone, etc.).
     */
    private String contactInfo;
}