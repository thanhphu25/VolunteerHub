package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing a published post within an event feed.
 * This response provides comprehensive details including the author's profile,
 * engagement statistics, and the current user's interaction state (isLiked).
 */
@Getter
@Setter
@AllArgsConstructor
public class PostResponse {

    /** The unique identifier of the post. */
    private Long id;

    /** The ID of the event this post is associated with. */
    private Long eventId;

    /** The unique identifier of the user who authored the post. */
    private Long userId;

    /** The display name of the post author. */
    private String userName;

    /** The URL path to the author's profile avatar. */
    private String userAvatarUrl;

    /** The textual content of the post. */
    private String content;

    /** The URL path to an optional image attached to the post. */
    private String imageUrl;

    /** The total number of likes this post has received. */
    private Integer likesCount;

    /** The total number of comments associated with this post. */
    private Integer commentsCount;

    /** * Indicates whether the currently authenticated user has liked this post.
     * Useful for toggling the "like" button state in the UI.
     */
    private Boolean isLiked;

    /** The timestamp when the post was first created. */
    private LocalDateTime createdAt;

    /** The timestamp of the last modification to the post. */
    private LocalDateTime updatedAt;
}