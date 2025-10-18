package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.NotificationEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserOrderByCreatedAtDesc(UserEntity user);
}
