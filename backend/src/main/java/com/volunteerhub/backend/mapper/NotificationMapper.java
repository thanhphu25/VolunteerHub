package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.entity.NotificationEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(NotificationEntity entity);
}
