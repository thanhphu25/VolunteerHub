package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.CommentCreateRequest;
import com.volunteerhub.backend.dto.CommentResponse;
import com.volunteerhub.backend.entity.PostCommentEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    PostCommentEntity toEntity(CommentCreateRequest dto);

    @Mapping(target = "postId", expression = "java(entity.getPost()!=null?entity.getPost().getId():null)")
    @Mapping(target = "userId", expression = "java(entity.getUser()!=null?entity.getUser().getId():null)")
    @Mapping(target = "userName", expression = "java(entity.getUser()!=null?entity.getUser().getFullName():null)")
    @Mapping(target = "createdAt", source = "createdAt")
    CommentResponse toResponse(PostCommentEntity entity);
}
