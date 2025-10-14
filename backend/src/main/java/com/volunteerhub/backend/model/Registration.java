package com.volunteerhub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Registration entity with builder + getters/setters
 */
@Entity
@Table(name = "registrations", uniqueConstraints = {@UniqueConstraint(columnNames = {"event_id", "volunteer_id"})})
public class Registration {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.pending;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "organizer_note", columnDefinition = "TEXT")
    private String organizerNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", length = 20)
    private AttendanceStatus attendanceStatus;

    @Column(name = "completion_note", columnDefinition = "TEXT")
    private String completionNote;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    public enum Status { pending, approved, rejected, cancelled, completed }
    public enum AttendanceStatus { absent, present }

    public Registration() {}

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getOrganizerNote() { return organizerNote; }
    public void setOrganizerNote(String organizerNote) { this.organizerNote = organizerNote; }

    public AttendanceStatus getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(AttendanceStatus attendanceStatus) { this.attendanceStatus = attendanceStatus; }

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

    // builder()
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long eventId;
        private Long volunteerId;
        private Status status;
        private String note;
        private String organizerNote;
        private AttendanceStatus attendanceStatus;
        private String completionNote;
        private LocalDateTime registeredAt;
        private LocalDateTime approvedAt;
        private LocalDateTime completedAt;
        private LocalDateTime cancelledAt;

        public Builder id(Long id) { this.id = id; return this;}
        public Builder eventId(Long eventId) { this.eventId = eventId; return this;}
        public Builder volunteerId(Long volunteerId) { this.volunteerId = volunteerId; return this;}
        public Builder status(Status status) { this.status = status; return this;}
        public Builder note(String note) { this.note = note; return this;}
        public Builder organizerNote(String organizerNote) { this.organizerNote = organizerNote; return this;}
        public Builder attendanceStatus(AttendanceStatus attendanceStatus) { this.attendanceStatus = attendanceStatus; return this;}
        public Builder completionNote(String completionNote) { this.completionNote = completionNote; return this;}
        public Builder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this;}
        public Builder approvedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; return this;}
        public Builder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this;}
        public Builder cancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; return this;}

        public Registration build() {
            Registration r = new Registration();
            r.setId(id);
            r.setEventId(eventId);
            r.setVolunteerId(volunteerId);
            r.setStatus(status == null ? Status.pending : status);
            r.setNote(note);
            r.setOrganizerNote(organizerNote);
            r.setAttendanceStatus(attendanceStatus);
            r.setCompletionNote(completionNote);
            r.setRegisteredAt(registeredAt == null ? LocalDateTime.now() : registeredAt);
            r.setApprovedAt(approvedAt);
            r.setCompletedAt(completedAt);
            r.setCancelledAt(cancelledAt);
            return r;
        }
    }

    @PrePersist
    public void prePersist() {
        if (registeredAt == null) registeredAt = LocalDateTime.now();
    }
}
