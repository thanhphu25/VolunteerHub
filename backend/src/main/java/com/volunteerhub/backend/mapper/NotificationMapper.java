package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.entity.NotificationEntity;
import org.mapstruct.Mapper;

/**
 * Mapper interface for converting notification-related objects.
 * Transforms between {@link NotificationEntity} and {@link NotificationResponse}
 * using MapStruct for compile-time type-safe mapping.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(NotificationEntity entity);
}
