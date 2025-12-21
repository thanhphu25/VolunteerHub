package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper interface for converting push subscription-related objects.
 * Handles transformation of {@link PushSubscriptionEntity} DTOs using MapStruct.
 */
@Mapper(componentModel = "spring")
public interface PushSubscriptionMapper {
}
