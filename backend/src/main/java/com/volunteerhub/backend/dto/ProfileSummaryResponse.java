package com.volunteerhub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileSummaryResponse {
    private UserProfile user;
    private VolunteerStats volunteer;
    private OrganizerStats organizer;
    private AdminStats admin;

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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolunteerStats {
        private long participated;
        private long pending;
        private long followingOrganizers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerStats {
        private long hosted;
        private long pending;
        private long totalParticipants;
        private long followers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminStats {
        private ApprovalStats approvals;
        private TimelineStats timeline;
        private List<LeaderboardEvent> topEvents;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalStats {
        private long approved;
        private long pending;
        private long deleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineStats {
        private long ended;
        private long ongoing;
        private long upcoming;
    }

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
