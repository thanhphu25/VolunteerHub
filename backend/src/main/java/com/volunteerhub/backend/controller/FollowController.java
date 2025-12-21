package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.OrganizerFollowResponse;
import com.volunteerhub.backend.service.IFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing the "Following" system.
 * Allows volunteers to follow or unfollow organizers and retrieve their list of followed organizers.
 */
@RestController
@RequestMapping("/api/me")
public class FollowController {

    private final IFollowService followService;

    /**
     * Constructs the FollowController with the follow service.
     * @param followService Service handling the social relationship logic between volunteers and organizers.
     */
    public FollowController(IFollowService followService) {
        this.followService = followService;
    }

    /**
     * Retrieves a list of all organizers currently followed by the authenticated volunteer.
     * Accessible only by users with the 'VOLUNTEER' role.
     * @param auth Current authentication context to identify the volunteer.
     * @return ResponseEntity containing a list of OrganizerFollowResponse objects.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @GetMapping("/following")
    public ResponseEntity<List<OrganizerFollowResponse>> listFollowing(Authentication auth) {
        return ResponseEntity.ok(followService.listFollowing(auth));
    }

    /**
     * Establishes a following relationship between the authenticated volunteer and an organizer.
     * @param organizerId The ID of the organizer to follow.
     * @param auth Current authentication context.
     * @return Success message or error details (400 if invalid ID, 403 if security constraint is violated).
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/following/{organizerId}")
    public ResponseEntity<?> followOrganizer(@PathVariable Long organizerId, Authentication auth) {
        try {
            followService.followOrganizer(organizerId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "Following successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Removes the following relationship between the authenticated volunteer and an organizer.
     * @param organizerId The ID of the organizer to unfollow.
     * @param auth Current authentication context.
     * @return Success message or 400 error if the organizer is not found or not followed.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @DeleteMapping("/following/{organizerId}")
    public ResponseEntity<?> unfollowOrganizer(@PathVariable Long organizerId, Authentication auth) {
        try {
            followService.unfollowOrganizer(organizerId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "Unfollowed successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }
}