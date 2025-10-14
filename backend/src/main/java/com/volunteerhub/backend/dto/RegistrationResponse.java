package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

/**
 * RegistrationResponse used by RegistrationService / controllers.
 * Provide no-arg and full-arg constructors to match multiple call sites.
 */
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private Long volunteerId;
    private String status;
    private String note;
    private String organizerNote;
    private String attendanceStatus;
    private String completionNote;
    private LocalDateTime registeredAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;

    public RegistrationResponse() {}

    public RegistrationResponse(Long id, Long eventId, Long volunteerId, String status, String note, String organizerNote,
                                String attendanceStatus, String completionNote, LocalDateTime registeredAt,
                                LocalDateTime approvedAt, LocalDateTime completedAt, LocalDateTime cancelledAt) {
        this.id = id;
        this.eventId = eventId;
        this.volunteerId = volunteerId;
        this.status = status;
        this.note = note;
        this.organizerNote = organizerNote;
        this.attendanceStatus = attendanceStatus;
        this.completionNote = completionNote;
        this.registeredAt = registeredAt;
        this.approvedAt = approvedAt;
        this.completedAt = completedAt;
        this.cancelledAt = cancelledAt;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getOrganizerNote() { return organizerNote; }
    public void setOrganizerNote(String organizerNote) { this.organizerNote = organizerNote; }
    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    public String getCompletionNote() { return completionNote; }
    public void setCompletionNote(String completionNote) { this.completionNote = completionNote; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
