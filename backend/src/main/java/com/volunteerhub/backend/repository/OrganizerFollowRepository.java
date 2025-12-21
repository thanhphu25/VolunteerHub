package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.OrganizerFollowEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing organizer follow relationships.
 * Enables tracking follower-organizer connections and deriving follow counts.
 */
public interface OrganizerFollowRepository extends JpaRepository<OrganizerFollowEntity, Long> {
    boolean existsByFollowerAndOrganizer(UserEntity follower, UserEntity organizer);

    Optional<OrganizerFollowEntity> findByFollowerAndOrganizer(UserEntity follower, UserEntity organizer);

    List<OrganizerFollowEntity> findByFollower(UserEntity follower);

    long countByOrganizer(UserEntity organizer);

    long countByFollower(UserEntity follower);
}
