package com.volunteerhub.backend.entity;

import com.volunteerhub.backend.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_subscriptions",
        indexes = {@Index(name = "idx_push_user", columnList = "user_id")})
@Getter
@Setter
@NoArgsConstructor
public class PushSubscriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "endpoint", columnDefinition = "TEXT", nullable = false)
    private String endpoint;

    @Column(name = "keys_json", columnDefinition = "JSON")
    private String keysJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
