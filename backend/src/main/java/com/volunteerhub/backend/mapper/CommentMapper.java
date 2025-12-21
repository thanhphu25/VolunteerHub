package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.CommentCreateRequest;
import com.volunteerhub.backend.dto.CommentResponse;
import com.volunteerhub.backend.entity.PostCommentEntity;
import org.mapstruct.*;

/**
 * Mapper interface for converting comment-related objects.
 * Transforms between {@link CommentCreateRequest}, {@link PostCommentEntity}, and {@link CommentResponse}
 * using MapStruct for compile-time type-safe mapping.
 */
@Mapper(componentModel = "spring")
public interface CommentMapper {

    /**
     * Converts a comment creation request DTO into a persistent entity.
     *
     * @param dto the data transfer object containing the new comment content.
     * @return a {@link PostCommentEntity} ready for association and persistence.
     */
    PostCommentEntity toEntity(CommentCreateRequest dto);

    /**
     * Maps a {@link PostCommentEntity} to a {@link CommentResponse} DTO.
     * Flattens complex relationships (User and Post) into simple fields
     * for frontend consumption, extracting IDs, author name, and avatar URL.
     *
     * @param entity the source persistent entity from the database.
     * @return a populated {@link CommentResponse} with flattened metadata.
     */
    @Mapping(target = "postId", expression = "java(entity.getPost()!=null?entity.getPost().getId():null)")
    @Mapping(target = "userId", expression = "java(entity.getUser()!=null?entity.getUser().getId():null)")
    @Mapping(target = "userName", expression = "java(entity.getUser()!=null?entity.getUser().getFullName():null)")
    @Mapping(target = "userAvatarUrl", expression = "java(entity.getUser()!=null?entity.getUser().getAvatarUrl():null)")
    @Mapping(target = "createdAt", source = "createdAt")
    CommentResponse toResponse(PostCommentEntity entity);
}