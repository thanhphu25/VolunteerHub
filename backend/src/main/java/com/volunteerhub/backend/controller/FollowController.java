package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.OrganizerFollowResponse;
import com.volunteerhub.backend.service.IFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class FollowController {

    private final IFollowService followService;

    public FollowController(IFollowService followService) {
        this.followService = followService;
    }

    @PreAuthorize("hasRole('VOLUNTEER')")
    @GetMapping("/following")
    public ResponseEntity<List<OrganizerFollowResponse>> listFollowing(Authentication auth) {
        return ResponseEntity.ok(followService.listFollowing(auth));
    }

    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/following/{organizerId}")
    public ResponseEntity<?> followOrganizer(@PathVariable Long organizerId, Authentication auth) {
        try {
            followService.followOrganizer(organizerId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "Theo dõi thành công"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasRole('VOLUNTEER')")
    @DeleteMapping("/following/{organizerId}")
    public ResponseEntity<?> unfollowOrganizer(@PathVariable Long organizerId, Authentication auth) {
        try {
            followService.unfollowOrganizer(organizerId, auth);
            return ResponseEntity.ok(java.util.Map.of("message", "Đã huỷ theo dõi"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }
}
