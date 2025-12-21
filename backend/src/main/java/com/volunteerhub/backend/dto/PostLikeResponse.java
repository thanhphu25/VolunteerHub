package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a "Like" interaction on a post.
 * Provides details about who liked the post and when the action occurred, 
 * enabling the frontend to display likes counts and lists of reacting users.
 */
@Getter
@Setter
@AllArgsConstructor
public class PostLikeResponse {

    /** The unique identifier of the like record. */
    private Long id;

    /** The ID of the post that was liked. */
    private Long postId;

    /** The unique identifier of the user who performed the like action. */
    private Long userId;

    /** The full name of the user who liked the post, used for display in like lists. */
    private String userName;

    /** The timestamp when the like was created. */
    private LocalDateTime createdAt;
}