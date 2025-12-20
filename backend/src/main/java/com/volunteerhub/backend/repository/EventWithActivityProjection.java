package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import java.time.LocalDateTime;

public interface EventWithActivityProjection {
    EventEntity getEvent();

    LocalDateTime getLastActivity();
}
