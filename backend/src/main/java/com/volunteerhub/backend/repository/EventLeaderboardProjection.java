package com.volunteerhub.backend.repository;

import java.time.LocalDateTime;

public interface EventLeaderboardProjection {
    Long getEventId();
    String getEventName();
    Long getRegistrations();
    Long getComments();
    LocalDateTime getCreatedAt();
}
