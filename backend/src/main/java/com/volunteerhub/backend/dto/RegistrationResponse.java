package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a volunteer's registration for an event.
 * This response provides a full audit trail of the registration lifecycle, 
 * including status changes, feedback notes, and attendance tracking.
 */
@Getter
@Setter
@AllArgsConstructor
public class RegistrationResponse {

    /** The unique identifier of the registration record. */
    private Long id;

    /** The unique identifier of the event. */
    private Long eventId;

    /** The name of the event, included for display in the volunteer's dashboard. */
    private String eventName;

    /** The unique identifier of the volunteer. */
    private Long volunteerId;

    /** The full name of the volunteer. */
    private String volunteerName;

    /** The contact email of the volunteer. */
    private String volunteerEmail;

    /** * The current workflow status of the registration.
     * e.g., "PENDING", "APPROVED", "REJECTED", "CANCELLED".
     */
    private String status;

    /** The original application note provided by the volunteer. */
    private String note;

    /** * Feedback or justification provided by the organizer 
     * during the approval or rejection process. 
     */
    private String organizerNote;

    /** * The record of actual presence at the event.
     * e.g., "PRESENT", "ABSENT", "NOT_MARKED".
     */
    private String attendanceStatus;

    /** A final note regarding the volunteer's performance or event wrap-up. */
    private String completionNote;

    /** The timestamp when the volunteer first applied. */
    private LocalDateTime registeredAt;

    /** The timestamp when the organizer approved the registration. */
    private LocalDateTime approvedAt;

    /** The timestamp when the registration was marked as finished or completed. */
    private LocalDateTime completedAt;

    /** The timestamp if the registration was withdrawn or cancelled. */
    private LocalDateTime cancelledAt;
}