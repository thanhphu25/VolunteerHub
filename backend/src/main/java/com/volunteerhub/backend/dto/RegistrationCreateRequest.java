package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for initiating an event registration request.
 * This class captures optional user input, such as a cover note or specific 
 * requirements, when a volunteer applies to participate in an event.
 */
@Getter
@Setter
public class RegistrationCreateRequest {

    /**
     * An optional message or note from the volunteer to the event organizer.
     * This may include information about their motivation, skills, or special 
     * requests. Restricted to 1000 characters to ensure concise communication.
     */
    @Size(max = 1000)
    private String note;
}