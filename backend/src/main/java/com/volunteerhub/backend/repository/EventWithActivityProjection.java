package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import java.time.LocalDateTime;

/**
 * Projection interface for events with recent activity metadata.
 * Combines event details with timestamp of the latest related activity.
 */
public interface EventWithActivityProjection {
    EventEntity getEvent();

    LocalDateTime getLastActivity();
}
