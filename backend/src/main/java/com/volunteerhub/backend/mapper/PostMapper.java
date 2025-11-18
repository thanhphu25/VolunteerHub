package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.PostCreateRequest;
import com.volunteerhub.backend.dto.PostResponse;
import com.volunteerhub.backend.entity.PostEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Post.
 * - toEntity ignores event & user (controller will set them)
 */
@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)       // controller will set event
    @Mapping(target = "user", ignore = true)        // controller will set user
    @Mapping(target = "likesCount", ignore = true)  // DB default / prePersist handles
    @Mapping(target = "commentsCount", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)   // prePersist will set
    @Mapping(target = "updatedAt", ignore = true)
    PostEntity toEntity(PostCreateRequest dto);

    @Mapping(target = "eventId", expression = "java(entity.getEvent()!=null?entity.getEvent().getId():null)")
    @Mapping(target = "userId", expression = "java(entity.getUser()!=null?entity.getUser().getId():null)")
    @Mapping(target = "userName", expression = "java(entity.getUser()!=null?entity.getUser().getFullName():null)")
    @Mapping(target = "userAvatarUrl", expression = "java(entity.getUser()!=null?entity.getUser().getAvatarUrl():null)")
    @Mapping(target = "likesCount", source = "likesCount")
    @Mapping(target = "commentsCount", source = "commentsCount")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    PostResponse toResponse(PostEntity entity);
}
