package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RegistrationRequest {
    @NotNull
    private Long eventId;
    private String note;

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
