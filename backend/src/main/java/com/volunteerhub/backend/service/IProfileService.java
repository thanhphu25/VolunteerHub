package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.ProfileSummaryResponse;
import com.volunteerhub.backend.dto.ProfileUpdateRequest;
import org.springframework.security.core.Authentication;

/**
 * Service interface for managing user profiles and statistics.
 * Provides profile retrieval and updates with role-specific metrics.
 */
public interface IProfileService {
    ProfileSummaryResponse getProfile(Authentication auth);

    ProfileSummaryResponse updateProfile(ProfileUpdateRequest request, Authentication auth);
}
