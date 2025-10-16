package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.PostCreateRequest;
import com.volunteerhub.backend.dto.PostResponse;
import com.volunteerhub.backend.dto.CommentCreateRequest;
import com.volunteerhub.backend.dto.CommentResponse;
import com.volunteerhub.backend.dto.PostLikeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface IPostService {
    PostResponse createPost(Long eventId, PostCreateRequest req, Authentication auth);
    Page<PostResponse> listPosts(Long eventId, Pageable pageable);
    CommentResponse addComment(Long postId, CommentCreateRequest req, Authentication auth);
    List<CommentResponse> listComments(Long postId);
    void likePost(Long postId, Authentication auth);
    void unlikePost(Long postId, Authentication auth);
    List<PostLikeResponse> listLikes(Long postId);
}
