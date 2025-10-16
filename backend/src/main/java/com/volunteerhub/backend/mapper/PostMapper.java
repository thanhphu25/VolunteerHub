package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.PostCreateRequest;
import com.volunteerhub.backend.dto.PostResponse;
import com.volunteerhub.backend.entity.PostEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostEntity toEntity(PostCreateRequest dto);

    @Mapping(target = "eventId", expression = "java(entity.getEvent()!=null?entity.getEvent().getId():null)")
    @Mapping(target = "userId", expression = "java(entity.getUser()!=null?entity.getUser().getId():null)")
    @Mapping(target = "userName", expression = "java(entity.getUser()!=null?entity.getUser().getFullName():null)")
    @Mapping(target = "likesCount", source = "likesCount")
    @Mapping(target = "commentsCount", source = "commentsCount")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    PostResponse toResponse(PostEntity entity);
}
