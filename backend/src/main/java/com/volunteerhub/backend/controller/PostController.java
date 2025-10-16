package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.*;
import com.volunteerhub.backend.service.IPostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PostController {

    private final IPostService svc;

    public PostController(IPostService svc) {
        this.svc = svc;
    }

    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/posts")
    public ResponseEntity<?> createPost(@PathVariable Long eventId, @Valid @RequestBody PostCreateRequest req, Authentication auth) {
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

    @GetMapping("/events/{eventId}/posts")
    public ResponseEntity<?> listPosts(@PathVariable Long eventId,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        var p = svc.listPosts(eventId, PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }

    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, @Valid @RequestBody CommentCreateRequest req, Authentication auth) {
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

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> listComments(@PathVariable Long postId) {
        try {
            List<CommentResponse> list = svc.listComments(postId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

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
