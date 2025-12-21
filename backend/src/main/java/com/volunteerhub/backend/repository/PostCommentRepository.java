package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.PostCommentEntity;
import com.volunteerhub.backend.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for managing post comments.
 * Provides queries to retrieve comments for a post, excluding soft-deleted entries.
 */
public interface PostCommentRepository extends JpaRepository<PostCommentEntity, Long> {
    List<PostCommentEntity> findByPostAndIsDeletedFalseOrderByCreatedAtAsc(PostEntity post);
}
