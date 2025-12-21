package com.volunteerhub.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizer_follows", uniqueConstraints = @UniqueConstraint(name = "unique_follow", columnNames = {
        "follower_id", "organizer_id" }))
@Getter
@Setter
@NoArgsConstructor
/**
 * Represents a follower relationship where a `follower` user follows an
 * `organizer` user. Uniqueness is enforced per follower-organizer pair.
 */
public class OrganizerFollowEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private UserEntity follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private UserEntity organizer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
