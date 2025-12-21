package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.OrganizerFollowResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

/**
 * Service interface for managing organizer follow relationships.
 * Enables users to follow/unfollow organizers and track followers.
 */
public interface IFollowService {
    void followOrganizer(Long organizerId, Authentication auth);

    void unfollowOrganizer(Long organizerId, Authentication auth);

    List<OrganizerFollowResponse> listFollowing(Authentication auth);

    long countFollowers(Long organizerId);
}
