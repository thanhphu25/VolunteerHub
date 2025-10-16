package com.volunteerhub.backend.entity;

import com.volunteerhub.backend.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations",
        uniqueConstraints = @UniqueConstraint(name = "unique_registration", columnNames = {"event_id", "volunteer_id"}))
@Getter
@Setter
@NoArgsConstructor
public class RegistrationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // event_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private com.volunteerhub.backend.entity.EventEntity event;

    // volunteer_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private UserEntity volunteer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.pending;

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

    @PrePersist
    public void prePersist() {
        this.registeredAt = LocalDateTime.now();
    }

    public enum RegistrationStatus {
        pending, approved, rejected, cancelled, completed
    }

    public enum AttendanceStatus {
        absent, present
    }
}
