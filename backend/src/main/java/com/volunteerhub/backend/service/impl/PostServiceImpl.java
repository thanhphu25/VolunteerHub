package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.*;
import com.volunteerhub.backend.entity.*;
import com.volunteerhub.backend.mapper.CommentMapper;
import com.volunteerhub.backend.mapper.PostMapper;
import com.volunteerhub.backend.repository.*;
import com.volunteerhub.backend.dto.PostLikeResponse;
import com.volunteerhub.backend.mapper.PostLikeMapper;
import com.volunteerhub.backend.service.IPostService;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements IPostService {

    private final PostRepository postRepo;
    private final EventRepository eventRepo;
    private final PostMapper postMapper;
    private final PostCommentRepository commentRepo;
    private final CommentMapper commentMapper;
    private final PostLikeRepository likeRepo;
    private final UserRepository userRepo;
    private final RegistrationRepository registrationRepo;
    private final PostLikeMapper postLikeMapper;

    public PostServiceImpl(PostRepository postRepo,
                           EventRepository eventRepo,
                           PostMapper postMapper,
                           PostCommentRepository commentRepo,
                           CommentMapper commentMapper,
                           PostLikeRepository likeRepo,
                           UserRepository userRepo,
                           RegistrationRepository registrationRepo,
                           PostLikeMapper postLikeMapper) {
        this.postRepo = postRepo;
        this.eventRepo = eventRepo;
        this.postMapper = postMapper;
        this.commentRepo = commentRepo;
        this.commentMapper = commentMapper;
        this.likeRepo = likeRepo;
        this.userRepo = userRepo;
        this.registrationRepo = registrationRepo;
        this.postLikeMapper = postLikeMapper;
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        return userRepo.findById(cud.getUserEntity().getId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private boolean isParticipantOrStaff(UserEntity user, EventEntity event) {
        // admin or organizer of event allowed
        if (user.getRole() != null && "admin".equalsIgnoreCase(user.getRole().name())) return true;
        if (event.getOrganizer() != null && event.getOrganizer().getId().equals(user.getId())) return true;
        // check approved registration
        var regOpt = registrationRepo.findByEventAndVolunteer(event, user);
        if (regOpt.isPresent()) {
            var r = regOpt.get();
            return r.getStatus() == RegistrationEntity.RegistrationStatus.approved;
        }
        return false;
    }

    @Override
    @Transactional
    public PostResponse createPost(Long eventId, PostCreateRequest req, Authentication auth) {
        UserEntity user = currentUser(auth);
        EventEntity event = eventRepo.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (event.getStatus() == null || !"approved".equalsIgnoreCase(event.getStatus().name())) {
            throw new IllegalArgumentException("Event must be approved to open posts");
        }
        if (!isParticipantOrStaff(user, event)) {
            throw new SecurityException("Not allowed to post on this event");
        }

        PostEntity p = postMapper.toEntity(req);
        p.setEvent(event);
        p.setUser(user);
        p.setLikesCount(0);
        p.setCommentsCount(0);
        PostEntity saved = postRepo.save(p);
        return postMapper.toResponse(saved);
    }

    @Override
    public Page<PostResponse> listPosts(Long eventId, Pageable pageable) {
        EventEntity event = eventRepo.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        return postRepo.findByEventAndIsDeletedFalseOrderByCreatedAtDesc(event, pageable).map(postMapper::toResponse);
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long postId, CommentCreateRequest req, Authentication auth) {
        UserEntity user = currentUser(auth);
        PostEntity post = postRepo.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));

        EventEntity event = post.getEvent();
        if (!isParticipantOrStaff(user, event)) {
            throw new SecurityException("Not allowed to comment on this post");
        }

        PostCommentEntity c = commentMapper.toEntity(req);
        c.setPost(post);
        c.setUser(user);
        PostCommentEntity saved = commentRepo.save(c);

        // increment comment counter
        post.setCommentsCount((post.getCommentsCount() == null ? 0 : post.getCommentsCount()) + 1);
        postRepo.save(post);

        return commentMapper.toResponse(saved);
    }

    @Override
    public List<CommentResponse> listComments(Long postId) {
        PostEntity post = postRepo.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return commentRepo.findByPostAndIsDeletedFalseOrderByCreatedAtAsc(post).stream().map(commentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void likePost(Long postId, Authentication auth) {
        UserEntity user = currentUser(auth);
        PostEntity post = postRepo.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));

        EventEntity event = post.getEvent();
        if (!isParticipantOrStaff(user, event)) {
            throw new SecurityException("Not allowed to like this post");
        }

        // create like if not exists
        try {
            var maybe = likeRepo.findByPostAndUser(post, user);
            if (maybe.isPresent()) {
                // already liked -> ignore or throw
                return;
            }
            PostLikeEntity like = new PostLikeEntity();
            like.setPost(post);
            like.setUser(user);
            likeRepo.save(like);
            post.setLikesCount((post.getLikesCount() == null ? 0 : post.getLikesCount()) + 1);
            postRepo.save(post);
        } catch (DataIntegrityViolationException ex) {
            // unique constraint violation -> ignore
        }
    }

    @Override
    @Transactional
    public void unlikePost(Long postId, Authentication auth) {
        UserEntity user = currentUser(auth);
        PostEntity post = postRepo.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));

        EventEntity event = post.getEvent();
        if (!isParticipantOrStaff(user, event)) {
            throw new SecurityException("Not allowed to unlike this post");
        }

        var maybe = likeRepo.findByPostAndUser(post, user);
        if (maybe.isPresent()) {
            likeRepo.delete(maybe.get());
            int cur = post.getLikesCount() != null ? post.getLikesCount() : 0;
            post.setLikesCount(Math.max(0, cur - 1));
            postRepo.save(post);
        }
    }

    @Override
    public java.util.List<PostLikeResponse> listLikes(Long postId) {
        PostEntity post = postRepo.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return likeRepo.findByPost(post).stream()
                .map(postLikeMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

}
