package com.volunteerhub.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Event entity mapped to table `events` (matches V1__init.sql).
 * - organizer: ManyToOne -> users (organizer)
 * - approvedBy: ManyToOne -> users (nullable)
 * - status: use shared enum com.volunteerhub.backend.entity.EventStatus
 * - version: optimistic locking column mapped to `version`
 */
@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // organizer reference to users.id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private UserEntity organizer;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 100, nullable = false)
    private String category;

    @Column(length = 500, nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "max_volunteers")
    private Integer maxVolunteers; // nullable -> no limit

    @Column(name = "current_volunteers", nullable = false)
    private Integer currentVolunteers = 0;

    // use shared enum declared elsewhere in package
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status = EventStatus.pending;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "contact_info", length = 255)
    private String contactInfo;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Approved by as reference to user who approved (matches FK in DB)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", nullable = true)
    private UserEntity approvedBy;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.currentVolunteers == null) this.currentVolunteers = 0;
        if (this.version == null) this.version = 0L;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
