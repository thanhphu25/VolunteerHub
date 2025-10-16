package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.PostLikeResponse;
import com.volunteerhub.backend.entity.PostLikeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostLikeMapper {

    @Mapping(target = "postId", expression = "java(entity.getPost()!=null?entity.getPost().getId():null)")
    @Mapping(target = "userId", expression = "java(entity.getUser()!=null?entity.getUser().getId():null)")
    @Mapping(target = "userName", expression = "java(entity.getUser()!=null?entity.getUser().getFullName():null)")
    @Mapping(target = "createdAt", source = "createdAt")
    PostLikeResponse toResponse(PostLikeEntity entity);
}
