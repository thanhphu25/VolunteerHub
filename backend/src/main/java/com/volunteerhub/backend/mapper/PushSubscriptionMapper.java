package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PushSubscriptionMapper {
    // nếu bạn tạo DTO response, map ở đây; ví dụ map endpoint và keysJson
    // PushSubscriptionResponse toResponse(PushSubscriptionEntity entity);
}
