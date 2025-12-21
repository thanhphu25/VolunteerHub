package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object sent to the client after successful authentication.
 * It contains the necessary JWT tokens for session management and basic 
 * user profile information for the frontend to display.
 */
@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

    /** The short-lived JWT used for authorizing API requests. */
    private String accessToken;

    /** The long-lived token used to obtain a new access token without re-logging in. */
    private String refreshToken;

    /** The scheme used for the token, typically "Bearer". */
    private String tokenType;

    /** The unique identifier of the authenticated user. */
    private Long userId;

    /** The email address of the authenticated user. */
    private String email;

    /** The full name of the authenticated user. */
    private String fullName;

    /** The security role assigned to the user (e.g., VOLUNTEER, ORGANIZER, ADMIN). */
    private String role;

    /**
     * Primary constructor used by the Auth service.
     * Automatically sets the tokenType to "Bearer".
     *
     * @param accessToken  The generated access JWT.
     * @param refreshToken The generated refresh token.
     * @param userId       The database ID of the user.
     * @param email        The user's registered email.
     * @param fullName     The user's display name.
     * @param role         The user's primary authority.
     */
    public AuthResponse(String accessToken, String refreshToken, Long userId, String email, String fullName,
            String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}