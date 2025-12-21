package com.volunteerhub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A polymorphic Data Transfer Object that provides a comprehensive summary of a user's profile.
 * It includes basic identity information and conditional statistics based on the user's role.
 * Null stat blocks are excluded from the JSON response to keep the payload clean.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileSummaryResponse {

    /** Basic personal and account details of the user. */
    private UserProfile user;

    /** Statistics relevant to users with the VOLUNTEER role. */
    private VolunteerStats volunteer;

    /** Statistics relevant to users with the ORGANIZER role. */
    private OrganizerStats organizer;

    /** Global system statistics and leaderboards relevant to the ADMIN role. */
    private AdminStats admin;

    /**
     * Inner class representing basic user identity and contact information.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfile {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private String role;
    }

    /**
     * Inner class representing a volunteer's engagement metrics.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolunteerStats {
        /** Number of events the user has successfully participated in. */
        private long participated;
        /** Number of event registrations currently awaiting approval. */
        private long pending;
        /** Total count of organizers this volunteer follows. */
        private long followingOrganizers;
    }

    /**
     * Inner class representing an organizer's management metrics.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerStats {
        /** Number of events created/hosted by this organizer. */
        private long hosted;
        /** Number of event proposals awaiting administrative approval. */
        private long pending;
        /** Cumulative count of approved volunteers across all hosted events. */
        private long totalParticipants;
        /** Total count of volunteers following this organizer. */
        private long followers;
    }

    /**
     * Inner class representing administrative oversight metrics and leaderboards.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminStats {
        /** Counts of event approvals and moderations. */
        private ApprovalStats approvals;
        /** Counts of events categorized by their current timeframe. */
        private TimelineStats timeline;
        /** List of high-engagement events for the admin leaderboard. */
        private List<LeaderboardEvent> topEvents;
    }

    /**
     * Breakdown of event moderation statuses.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalStats {
        private long approved;
        private long pending;
        private long deleted;
    }

    /**
     * Breakdown of events based on their occurrence timeline.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineStats {
        private long ended;
        private long ongoing;
        private long upcoming;
    }

    /**
     * Represents a summarized event entry for administrative leaderboard views.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaderboardEvent {
        private Long id;
        private String name;
        private long registrations;
        private long comments;
        private LocalDateTime createdAt;
    }
}