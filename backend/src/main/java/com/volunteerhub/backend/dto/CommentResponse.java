package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a comment on a post.
 * This response object provides the full context of a comment, including
 * the author's profile details for UI rendering (name and avatar).
 */
@Getter
@Setter
@AllArgsConstructor
public class CommentResponse {

    /** The unique identifier of the comment. */
    private Long id;

    /** The ID of the post to which this comment belongs. */
    private Long postId;

    /** The unique identifier of the user who wrote the comment. */
    private Long userId;

    /** The display name of the user who wrote the comment. */
    private String userName;

    /** The URL to the user's profile picture. */
    private String userAvatarUrl;

    /** The textual content of the comment. */
    private String content;

    /** The timestamp indicating when the comment was published. */
    private LocalDateTime createdAt;
}