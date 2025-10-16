package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.PostLikeEntity;
import com.volunteerhub.backend.entity.PostEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, Long> {
    Optional<PostLikeEntity> findByPostAndUser(PostEntity post, UserEntity user);
    List<PostLikeEntity> findByPost(PostEntity post);
    long countByPost(PostEntity post);
    void deleteByPostAndUser(PostEntity post, UserEntity user);
}
