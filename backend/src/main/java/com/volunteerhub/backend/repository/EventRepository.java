package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity, Long> {
    Page<EventEntity> findByStatus(EventStatus status, Pageable pageable);
    Page<EventEntity> findByStatusAndIsDeletedFalse(EventStatus status, Pageable pageable);
    Page<EventEntity> findByIsDeletedFalse(Pageable pageable);
    Page<EventEntity> findByOrganizerIdAndIsDeletedFalse(Long organizerId, Pageable pageable);
}
