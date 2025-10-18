package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionEntity, Long> {
    Optional<PushSubscriptionEntity> findByUserAndEndpoint(UserEntity user, String endpoint);
    List<PushSubscriptionEntity> findByUser(UserEntity user);
    void deleteByUserAndEndpoint(UserEntity user, String endpoint);
}
