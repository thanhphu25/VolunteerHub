package com.volunteerhub.backend.repository;

import java.time.LocalDateTime;

/**
 * Projection interface for event leaderboard data.
 * Aggregates event statistics including registration and comment counts.
 */
public interface EventLeaderboardProjection {
    Long getEventId();

    String getEventName();

    Long getRegistrations();

    Long getComments();

    LocalDateTime getCreatedAt();
}
