package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.OrganizerFollowResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface IFollowService {
    void followOrganizer(Long organizerId, Authentication auth);
    void unfollowOrganizer(Long organizerId, Authentication auth);
    List<OrganizerFollowResponse> listFollowing(Authentication auth);
    long countFollowers(Long organizerId);
}
