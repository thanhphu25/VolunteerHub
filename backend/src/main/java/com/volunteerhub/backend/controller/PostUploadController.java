package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.PostCreateRequest;
import com.volunteerhub.backend.dto.PostResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.PostEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.exception.FileValidationException;
import com.volunteerhub.backend.mapper.PostMapper;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.PostRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.service.storage.FileValidationService;
import com.volunteerhub.backend.service.storage.StorageService;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PostUploadController {

    private final Logger logger = LoggerFactory.getLogger(PostUploadController.class);

    private final StorageService storageService;
    private final FileValidationService fileValidationService;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;

    public PostUploadController(StorageService storageService,
                                FileValidationService fileValidationService,
                                EventRepository eventRepository,
                                UserRepository userRepository,
                                PostRepository postRepository,
                                PostMapper postMapper) {
        this.storageService = storageService;
        this.fileValidationService = fileValidationService;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.postMapper = postMapper;
    }

    // ------------------------
    // Upload avatar endpoint
    // ------------------------
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(org.springframework.security.core.Authentication authentication,
                                          @RequestPart("file") MultipartFile file) {
        Long userId = extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot determine user id"));
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // validate + save
        try {
            fileValidationService.validateImage(file);
            String url = storageService.store(file);
            UserEntity user = userOpt.get();
            user.setAvatarUrl(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("avatarUrl", url));
        } catch (FileValidationException fve) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file", "details", fve.getMessage()));
        } catch (IOException ioe) {
            logger.error("Avatar upload IO error", ioe);
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed", "details", ioe.getMessage()));
        } catch (Exception ex) {
            logger.error("Avatar upload unexpected error", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed", "details", ex.getMessage()));
        }
    }

    // ------------------------
    // Create post with optional image
    // ------------------------
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/events/{eventId}/posts-img")
    public ResponseEntity<?> createPostWithImage(@PathVariable Long eventId,
                                                 @RequestPart("content") @NotBlank String content,
                                                 @RequestPart(value = "file", required = false) MultipartFile file,
                                                 org.springframework.security.core.Authentication authentication) {
        // validate event exists
        Optional<EventEntity> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Event not found"));
        }
        EventEntity event = eventOpt.get();

        // determine user id from authentication principal
        Long userId = extractUserIdFromAuth(authentication);
        if (userId == null) return ResponseEntity.status(403).body(Map.of("error", "Cannot determine user id"));

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        UserEntity user = userOpt.get();

        String imageUrl = null;
        try {
            if (file != null && !file.isEmpty()) {
                fileValidationService.validateImage(file);
                imageUrl = storageService.store(file);
            }
        } catch (FileValidationException fve) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file", "details", fve.getMessage()));
        } catch (IOException ioe) {
            logger.error("Post image store IO error", ioe);
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed", "details", ioe.getMessage()));
        } catch (Exception ex) {
            logger.error("Post image unexpected error", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed", "details", ex.getMessage()));
        }

        // build DTO
        PostCreateRequest dto = new PostCreateRequest();
        dto.setContent(content);
        dto.setImageUrl(imageUrl);

        // map DTO -> entity (mapper ignores event/user)
        PostEntity post = postMapper.toEntity(dto);

        post.setEvent(event);
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());

        PostEntity saved = postRepository.save(post);
        PostResponse resp = postMapper.toResponse(saved);
        return ResponseEntity.ok(resp);
    }

    // helper to extract user id from Authentication.principal
    private Long extractUserIdFromAuth(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return null;
        try {
            Object principal = authentication.getPrincipal();
            try {
                Method m = principal.getClass().getMethod("getId");
                Object idv = m.invoke(principal);
                if (idv instanceof Number) return ((Number) idv).longValue();
            } catch (Throwable ignored) {}
            // fallback: parse authentication.getName()
            String name = authentication.getName();
            if (name != null && name.matches("\\d+")) {
                return Long.parseLong(name);
            }
        } catch (Throwable ignored) {}
        return null;
    }
}
