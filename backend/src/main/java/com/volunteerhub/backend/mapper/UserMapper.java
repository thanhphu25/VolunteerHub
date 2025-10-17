package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Use toString() so it works whether UserEntity.role/status is enum or string
    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().toString() : null)")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().toString() : null)")
    UserResponse toResponse(UserEntity user);
}
