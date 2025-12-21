package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for rejecting an event proposal.
 * This DTO is used by administrators to provide formal feedback to an organizer
 * regarding why their event submission was not approved.
 */
@Getter
@Setter
public class EventRejectRequest {

    /**
     * The justification for rejecting the event.
     * This field is mandatory to ensure organizers receive clear instructions 
     * or reasons for the rejection, allowing them to make necessary adjustments.
     */
    @NotBlank
    private String reason;
}