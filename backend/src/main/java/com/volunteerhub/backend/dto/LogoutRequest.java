package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for requesting a user logout.
 * This DTO specifically carries the refresh token, allowing the backend
 * to invalidate or blacklist it, effectively ending the user's session 
 * across devices or preventing new access tokens from being generated.
 */
@Getter
@Setter
public class LogoutRequest {

    /**
     * The long-lived refresh token currently held by the client.
     * This field is mandatory as it is the primary identifier used by the 
     * security service to revoke session persistence.
     */
    @NotBlank
    private String refreshToken;
}