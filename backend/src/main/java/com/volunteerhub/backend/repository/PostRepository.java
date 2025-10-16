package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.PostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<PostEntity, Long> {
    Page<PostEntity> findByEventAndIsDeletedFalseOrderByCreatedAtDesc(EventEntity event, Pageable pageable);
}
