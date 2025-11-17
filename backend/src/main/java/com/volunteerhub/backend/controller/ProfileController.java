package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.ProfileSummaryResponse;
import com.volunteerhub.backend.dto.ProfileUpdateRequest;
import com.volunteerhub.backend.service.IProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final IProfileService profileService;

    public ProfileController(IProfileService profileService) {
        this.profileService = profileService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<ProfileSummaryResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(profileService.getProfile(auth));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile")
    public ResponseEntity<ProfileSummaryResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                                                Authentication auth) {
        return ResponseEntity.ok(profileService.updateProfile(request, auth));
    }
}
