package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.*;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.service.IPostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing discussion posts, comments, and likes within events.
 * Handles the social interaction layer of the volunteer platform.
 */
@RestController
@RequestMapping("/api")
public class PostController {

    private final IPostService svc;
    private final EventRepository eventRepo;

    /**
     * Constructs the PostController with required services and repositories.
     * @param svc Service handling post, comment, and like business logic.
     * @param eventRepo Repository for accessing event status and details.
     */
    public PostController(IPostService svc, EventRepository eventRepo) {
        this.svc = svc;
        this.eventRepo = eventRepo;
    }

    /**
     * Creates a new post within a specific event's discussion channel.
     * Accessible by Volunteers, Organizers, and Admins.
     * @param eventId The ID of the event where the post will be created.
     * @param req The post content and details.
     * @param auth Current authentication context.
     * @return Created post details or error status (403 if unauthorized, 400 if invalid ID).
     */
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/posts")
    public ResponseEntity<?> createPost(@PathVariable Long eventId, @Valid @RequestBody PostCreateRequest req,
            Authentication auth) {
        try {
            PostResponse resp = svc.createPost(eventId, req, auth);
            return ResponseEntity.status(201).body(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to create post"));
        }
    }

    /**
     * Lists all posts for a specific event with pagination.
     * Discussions are only accessible for events that have been approved.
     * @param eventId The ID of the event.
     * @param page Page index (default 0).
     * @param size Page size (default 10).
     * @param auth Current authentication context.
     * @return Paginated list of posts or 403 if the event is not approved.
     */
    @GetMapping("/events/{eventId}/posts")
    public ResponseEntity<?> listPosts(@PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        try {
            EventEntity event = eventRepo.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            // Discussions are restricted to approved events only
            if (event.getStatus() == null || !EventStatus.approved.equals(event.getStatus())) {
                return ResponseEntity.status(403)
                        .body(java.util.Map.of("error", "Discussion channel is only available for approved events"));
            }

            var posts = svc.listPosts(eventId, PageRequest.of(page, size), auth);
            return ResponseEntity.ok(posts);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to list posts"));
        }
    }

    /**
     * Adds a comment to an existing post.
     * @param postId The ID of the post to comment on.
     * @param req The comment content.
     * @param auth Current authentication context.
     * @return Created comment details.
     */
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, @Valid @RequestBody CommentCreateRequest req,
            Authentication auth) {
        try {
            CommentResponse resp = svc.addComment(postId, req, auth);
            return ResponseEntity.status(201).body(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to add comment"));
        }
    }

    /**
     * Retrieves all comments associated with a specific post.
     * @param postId The ID of the post.
     * @return List of comment responses.
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> listComments(@PathVariable Long postId) {
        try {
            List<CommentResponse> list = svc.listComments(postId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Registers a 'like' on a post from the authenticated user.
     * @param postId The ID of the post to like.
     * @param auth Current authentication context.
     * @return Success message.
     */
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @PostMapping("/posts/{postId}/likes")
    public ResponseEntity<?> like(@PathVariable Long postId, Authentication auth) {
        try {
            svc.likePost(postId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "liked"));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Removes a 'like' from a post for the authenticated user.
     * @param postId The ID of the post to unlike.
     * @param auth Current authentication context.
     * @return Success message.
     */
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @DeleteMapping("/posts/{postId}/likes")
    public ResponseEntity<?> unlike(@PathVariable Long postId, Authentication auth) {
        try {
            svc.unlikePost(postId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "unliked"));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Lists all users who have liked a specific post.
     * @param postId The ID of the post.
     * @return List of like details (user info).
     */
    @GetMapping("/posts/{postId}/likes")
    public ResponseEntity<?> listLikes(@PathVariable Long postId) {
        try {
            java.util.List<PostLikeResponse> list = svc.listLikes(postId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to list likes"));
        }
    }
}