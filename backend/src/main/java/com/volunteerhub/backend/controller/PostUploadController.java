package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.PostCreateRequest;
import com.volunteerhub.backend.dto.PostResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.entity.PostEntity;
import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.exception.FileValidationException;
import com.volunteerhub.backend.mapper.PostMapper;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.PostRepository;
import com.volunteerhub.backend.repository.RegistrationRepository;
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

/**
 * Controller for handling specialized post operations involving file uploads.
 * Manages user avatars and event discussion posts that include images.
 */
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
    private final RegistrationRepository registrationRepository;

    /**
     * Constructs the PostUploadController with necessary storage, validation, and repository services.
     */
    public PostUploadController(StorageService storageService,
            FileValidationService fileValidationService,
            EventRepository eventRepository,
            UserRepository userRepository,
            PostRepository postRepository,
            PostMapper postMapper,
            RegistrationRepository registrationRepository) {
        this.storageService = storageService;
        this.fileValidationService = fileValidationService;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.postMapper = postMapper;
        this.registrationRepository = registrationRepository;
    }

    /**
     * Uploads and updates the avatar for the currently authenticated user.
     * Validates the file as an image before storing it and updating the user record.
     * * @param authentication The current user's authentication context.
     * @param file The image file to be used as an avatar.
     * @return ResponseEntity containing the new avatar URL or error details.
     */
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

    /**
     * Creates a discussion post for an event, optionally including an image.
     * Only approved event participants, organizers, or admins are allowed to post.
     * * @param eventId The ID of the event.
     * @param content The text content of the post.
     * @param file Optional image file attached to the post.
     * @param authentication The current user's authentication context.
     * @return ResponseEntity containing the created post details or error details.
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/events/{eventId}/posts-img")
    public ResponseEntity<?> createPostWithImage(@PathVariable Long eventId,
            @RequestPart("content") @NotBlank String content,
            @RequestPart(value = "file", required = false) MultipartFile file,
            org.springframework.security.core.Authentication authentication) {
        Optional<EventEntity> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Event not found"));
        }
        EventEntity event = eventOpt.get();

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            return ResponseEntity.status(404).body(Map.of("error", "Event not found"));
        }

        // Posting is restricted to approved events
        if (event.getStatus() == null || event.getStatus() != EventStatus.approved) {
            return ResponseEntity.status(403).body(Map.of("error", "Event must be approved to open posts"));
        }

        Long userId = extractUserIdFromAuth(authentication);
        if (userId == null)
            return ResponseEntity.status(403).body(Map.of("error", "Cannot determine user id"));

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        UserEntity user = userOpt.get();

        // Check if user has permission to post in this event's channel
        if (!isParticipantOrStaff(user, event)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed to post on this event"));
        }

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

        PostCreateRequest dto = new PostCreateRequest();
        dto.setContent(content);
        dto.setImageUrl(imageUrl);

        PostEntity post = postMapper.toEntity(dto);

        post.setEvent(event);
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());

        PostEntity saved = postRepository.save(post);
        PostResponse resp = postMapper.toResponse(saved);
        return ResponseEntity.ok(resp);
    }

    /**
     * Extracts the User ID from the Authentication object.
     * Uses reflection to attempt finding a 'getId' method on the principal,
     * or parses the authentication name if it is numeric.
     * * @param authentication The current authentication context.
     * @return The User ID as a Long, or null if it cannot be determined.
     */
    private Long extractUserIdFromAuth(org.springframework.security.core.Authentication authentication) {
        if (authentication == null)
            return null;
        try {
            Object principal = authentication.getPrincipal();
            try {
                Method m = principal.getClass().getMethod("getId");
                Object idv = m.invoke(principal);
                if (idv instanceof Number)
                    return ((Number) idv).longValue();
            } catch (Throwable ignored) {
            }
            String name = authentication.getName();
            if (name != null && name.matches("\\d+")) {
                return Long.parseLong(name);
            }
        } catch (Throwable ignored) {
        }
        return null;
    }

    /**
     * Determines if a user is allowed to post in an event discussion.
     * Permission is granted if the user is an admin, the event organizer, 
     * or a volunteer with an approved registration.
     * * @param user The user attempting to post.
     * @param event The target event.
     * @return true if permitted, false otherwise.
     */
    private boolean isParticipantOrStaff(UserEntity user, EventEntity event) {
        if (user.getRole() != null && "admin".equalsIgnoreCase(user.getRole().name()))
            return true;
        if (event.getOrganizer() != null && event.getOrganizer().getId().equals(user.getId()))
            return true;
        var regOpt = registrationRepository.findByEventAndVolunteer(event, user);
        if (regOpt.isPresent()) {
            var r = regOpt.get();
            return r.getStatus() == RegistrationEntity.RegistrationStatus.approved;
        }
        return false;
    }
}