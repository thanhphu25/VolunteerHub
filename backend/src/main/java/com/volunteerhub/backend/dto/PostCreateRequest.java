package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for requesting the creation of a new post.
 * This class is used to bind and validate user-submitted content for the event 
 * discussion feed, ensuring that posts meet length and content requirements.
 */
@Getter
@Setter
public class PostCreateRequest {

    /**
     * The main body text of the post.
     * Must not be blank and is restricted to 2000 characters to ensure 
     * readability and efficient data storage.
     */
    @NotBlank
    @Size(max = 2000)
    private String content;

    /**
     * An optional URL path to an image associated with the post.
     * Limited to 500 characters to prevent excessively long URI strings 
     * from impacting database performance.
     */
    @Size(max = 500)
    private String imageUrl;
}