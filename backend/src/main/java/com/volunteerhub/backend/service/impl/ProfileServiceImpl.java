package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.ProfileSummaryResponse;
import com.volunteerhub.backend.dto.ProfileUpdateRequest;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.EventLeaderboardProjection;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.OrganizerFollowRepository;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.service.IProfileService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileServiceImpl implements IProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final OrganizerFollowRepository followRepository;
    private final EventRepository eventRepository;

    public ProfileServiceImpl(UserRepository userRepository,
                              RegistrationRepository registrationRepository,
                              OrganizerFollowRepository followRepository,
                              EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.followRepository = followRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public ProfileSummaryResponse getProfile(Authentication auth) {
        UserEntity user = currentUser(auth);
        Role role = user.getRole();
        log.debug("Loaded profile for user {} role {}", user.getId(), role);

        ProfileSummaryResponse response = new ProfileSummaryResponse();
        response.setUser(new ProfileSummaryResponse.UserProfile(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().name() : null
        ));

        if (role == Role.volunteer) {
            ProfileSummaryResponse.VolunteerStats volunteerStats = buildVolunteerStats(user);
            response.setVolunteer(volunteerStats);
            log.debug("Volunteer stats: participated={}, pending={}, following={}",
                    volunteerStats.getParticipated(), volunteerStats.getPending(), volunteerStats.getFollowingOrganizers());
        }
        if (role == Role.organizer) {
            ProfileSummaryResponse.OrganizerStats organizerStats = buildOrganizerStats(user);
            response.setOrganizer(organizerStats);
            log.debug("Organizer stats: hosted={}, pending={}, participants={}, followers={}",
                    organizerStats.getHosted(), organizerStats.getPending(), organizerStats.getTotalParticipants(), organizerStats.getFollowers());
        }
        if (role == Role.admin) {
            ProfileSummaryResponse.AdminStats adminStats = buildAdminStats();
            response.setAdmin(adminStats);
            log.debug("Admin stats approvals: approved={}, pending={}, deleted={}",
                    adminStats.getApprovals().getApproved(),
                    adminStats.getApprovals().getPending(),
                    adminStats.getApprovals().getDeleted());
        }

        return response;
    }

    @Override
    @Transactional
    public ProfileSummaryResponse updateProfile(ProfileUpdateRequest request, Authentication auth) {
        UserEntity user = currentUser(auth);
        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone().trim());
        }
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail().trim());
        }
        userRepository.save(user);
        return getProfile(auth);
    }

    private ProfileSummaryResponse.VolunteerStats buildVolunteerStats(UserEntity volunteer) {
        long participated = registrationRepository.countActiveVolunteerRegistrations(volunteer, List.of(
                RegistrationEntity.RegistrationStatus.approved,
                RegistrationEntity.RegistrationStatus.completed
        ));
        long pending = registrationRepository.countActiveVolunteerRegistrationsByStatus(volunteer, RegistrationEntity.RegistrationStatus.pending);
        long following = followRepository.countByFollower(volunteer);
        log.debug("Volunteer calc -> participated={}, pending={}, following={}", participated, pending, following);
        return new ProfileSummaryResponse.VolunteerStats(participated, pending, following);
    }

    private ProfileSummaryResponse.OrganizerStats buildOrganizerStats(UserEntity organizer) {
        long hosted = eventRepository.countActiveByOrganizer(organizer);
        long pending = eventRepository.countActiveByOrganizerAndStatus(organizer, EventStatus.pending);
        long participants = registrationRepository.countActiveByOrganizerAndStatusIn(organizer, List.of(
                RegistrationEntity.RegistrationStatus.approved,
                RegistrationEntity.RegistrationStatus.completed
        ));
        long followers = followRepository.countByOrganizer(organizer);
        log.debug("Organizer calc -> hosted={}, pending={}, participants={}, followers={}", hosted, pending, participants, followers);
        return new ProfileSummaryResponse.OrganizerStats(hosted, pending, participants, followers);
    }

    private ProfileSummaryResponse.AdminStats buildAdminStats() {
        long approved = eventRepository.countActiveByStatus(EventStatus.approved);
        long pending = eventRepository.countActiveByStatus(EventStatus.pending);
        long deleted = eventRepository.countByIsDeletedTrue();

        LocalDateTime now = LocalDateTime.now();
        long ended = eventRepository.countActiveEndedBefore(now);
        long upcoming = eventRepository.countActiveStartingAfter(now);
        long ongoing = eventRepository.countActiveOngoing(now);

        log.debug("Admin calc -> approved={}, pending={}, deleted={}, ended={}, upcoming={}, ongoing={}",
                approved, pending, deleted, ended, upcoming, ongoing);

        List<ProfileSummaryResponse.LeaderboardEvent> topEvents = eventRepository.findTopEvents(10).stream()
                .map(this::mapLeaderboard)
                .collect(Collectors.toList());

        return new ProfileSummaryResponse.AdminStats(
                new ProfileSummaryResponse.ApprovalStats(approved, pending, deleted),
                new ProfileSummaryResponse.TimelineStats(ended, ongoing, upcoming),
                topEvents
        );
    }

    private ProfileSummaryResponse.LeaderboardEvent mapLeaderboard(EventLeaderboardProjection projection) {
        ProfileSummaryResponse.LeaderboardEvent event = new ProfileSummaryResponse.LeaderboardEvent(
                projection.getEventId(),
                projection.getEventName(),
                defaultValue(projection.getRegistrations()),
                defaultValue(projection.getComments()),
                projection.getCreatedAt()
        );
        log.trace("Leaderboard entry: {}", event);
        return event;
    }

    private long defaultValue(Long value) {
        return value == null ? 0L : value;
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails customUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userRepository.findById(customUserDetails.getUserEntity().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
