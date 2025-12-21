package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for creating a new comment on a post.
 * This DTO captures the textual content of a comment and enforces
 * length and presence constraints to ensure data quality.
 */
@Getter
@Setter
public class CommentCreateRequest {

    /**
     * The textual content of the comment.
     * Must not be blank and is restricted to a maximum of 1000 characters
     * to prevent database overflow and maintain readability.
     */
    @NotBlank
    @Size(max = 1000)
    private String content;
}