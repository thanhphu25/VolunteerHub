package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.OrganizerFollowResponse;
import com.volunteerhub.backend.entity.OrganizerFollowEntity;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.OrganizerFollowRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.service.IAuditService;
import com.volunteerhub.backend.service.IFollowService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FollowServiceImpl implements IFollowService {

    private final OrganizerFollowRepository followRepository;
    private final UserRepository userRepository;
    private final IAuditService auditService;

    public FollowServiceImpl(OrganizerFollowRepository followRepository,
                             UserRepository userRepository,
                             IAuditService auditService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public void followOrganizer(Long organizerId, Authentication auth) {
        UserEntity follower = currentUser(auth);
        if (follower.getRole() != Role.volunteer) {
            throw new SecurityException("Chỉ tình nguyện viên mới có thể theo dõi tổ chức");
        }

        UserEntity organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("Organizer not found"));

        if (organizer.getRole() != Role.organizer) {
            throw new IllegalArgumentException("User is not an organizer");
        }

        if (Objects.equals(follower.getId(), organizer.getId())) {
            throw new IllegalArgumentException("Không thể tự theo dõi chính mình");
        }

        boolean existed = followRepository.existsByFollowerAndOrganizer(follower, organizer);
        if (existed) {
            return;
        }

        OrganizerFollowEntity follow = new OrganizerFollowEntity();
        follow.setFollower(follower);
        follow.setOrganizer(organizer);
        followRepository.save(follow);

        try {
            auditService.log(auth, "follow:add", java.util.Map.of(
                    "followerId", follower.getId(),
                    "organizerId", organizer.getId()
            ));
        } catch (Exception ignored) {
        }
    }

    @Override
    @Transactional
    public void unfollowOrganizer(Long organizerId, Authentication auth) {
        UserEntity follower = currentUser(auth);
        UserEntity organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("Organizer not found"));

        followRepository.findByFollowerAndOrganizer(follower, organizer)
                .ifPresent(followRepository::delete);

        try {
            auditService.log(auth, "follow:remove", java.util.Map.of(
                    "followerId", follower.getId(),
                    "organizerId", organizer.getId()
            ));
        } catch (Exception ignored) {
        }
    }

    @Override
    public List<OrganizerFollowResponse> listFollowing(Authentication auth) {
        UserEntity follower = currentUser(auth);
        return followRepository.findByFollower(follower).stream()
                .map(follow -> {
                    UserEntity organizer = follow.getOrganizer();
                    return new OrganizerFollowResponse(
                            organizer.getId(),
                            organizer.getFullName(),
                            organizer.getEmail(),
                            organizer.getAvatarUrl(),
                            follow.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public long countFollowers(Long organizerId) {
        UserEntity organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("Organizer not found"));
        return followRepository.countByOrganizer(organizer);
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails customUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userRepository.findById(customUserDetails.getUserEntity().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
