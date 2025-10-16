package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.PostCommentEntity;
import com.volunteerhub.backend.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostCommentEntity, Long> {
    List<PostCommentEntity> findByPostAndIsDeletedFalseOrderByCreatedAtAsc(PostEntity post);
}
