package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper interface for converting user-related objects.
 * Transforms between {@link UserEntity} and {@link UserResponse}
 * using MapStruct for compile-time type-safe mapping.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().toString() : null)")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().toString() : null)")
    UserResponse toResponse(UserEntity user);
}
