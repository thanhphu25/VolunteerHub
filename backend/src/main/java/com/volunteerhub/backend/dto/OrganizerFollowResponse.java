package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a following relationship between a volunteer and an organizer.
 * This response provides the volunteer with essential profile information about the 
 * organizers they follow, used primarily in the "Following" list view.
 */
@Getter
@Setter
@AllArgsConstructor
public class OrganizerFollowResponse {

    /** The unique identifier of the organizer being followed. */
    private Long organizerId;

    /** The full name of the organizer. */
    private String organizerName;

    /** The contact email address of the organizer. */
    private String organizerEmail;

    /** The URL path to the organizer's profile picture or brand logo. */
    private String organizerAvatar;

    /** The timestamp indicating when the volunteer first followed this organizer. */
    private LocalDateTime followedAt;
}