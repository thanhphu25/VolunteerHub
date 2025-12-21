package com.volunteerhub.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Persistent entity representing a system audit log entry.
 * This class captures events and actions performed within the application,
 * providing an immutable record for security monitoring and administrative oversight.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "user_id"),
        @Index(name = "idx_audit_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class AuditLogEntity {

    /** The unique auto-incrementing identifier for the audit record. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who performed the action.
     * Nullable to support system-generated events or unauthenticated actions
     * (e.g., failed login attempts).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private UserEntity user;

    /**
     * Descriptive identifier for the action performed.
     * Examples: "USER_LOGIN", "EVENT_CREATED", "PASSWORD_CHANGED".
     */
    @Column(name = "action", length = 255, nullable = false)
    private String action;

    /**
     * Extended metadata about the action, stored as JSON.
     * Enables flexible logging based on the action context.
     */
    @Column(name = "details", columnDefinition = "JSON")
    private String details;

    /** The exact timestamp when the audit entry was recorded. */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Lifecycle callback to automatically set the creation timestamp 
     * before the record is persisted to the database.
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}