package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.ProfileSummaryResponse;
import com.volunteerhub.backend.dto.ProfileUpdateRequest;
import com.volunteerhub.backend.service.IProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing the authenticated user's personal profile.
 * Provides endpoints to retrieve and update user-specific information.
 */
@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final IProfileService profileService;

    /**
     * Constructs the ProfileController with the profile management service.
     * @param profileService Service handling the retrieval and modification of user profiles.
     */
    public ProfileController(IProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Retrieves the profile details of the currently authenticated user.
     * Requires the user to be logged in.
     * @param auth The authentication context used to identify the current user.
     * @return A ResponseEntity containing the user's profile summary.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<ProfileSummaryResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(profileService.getProfile(auth));
    }

    /**
     * Updates the profile information for the currently authenticated user.
     * Performs validation on the request body before applying changes.
     * @param request The DTO containing the updated profile fields.
     * @param auth The authentication context used to identify the current user.
     * @return A ResponseEntity containing the updated profile summary.
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile")
    public ResponseEntity<ProfileSummaryResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
            Authentication auth) {
        return ResponseEntity.ok(profileService.updateProfile(request, auth));
    }
}