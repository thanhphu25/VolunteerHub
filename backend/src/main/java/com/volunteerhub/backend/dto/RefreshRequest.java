package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for requesting a new access token.
 * This class is used when the short-lived access token has expired, 
 * allowing the client to exchange a valid refresh token for a 
 * fresh access and refresh token pair.
 */
@Getter
@Setter
public class RefreshRequest {

    /**
     * The long-lived token previously issued during login.
     * This field is mandatory as it serves as the proof of identity 
     * required to rotate the security credentials and extend the session.
     */
    @NotBlank
    private String refreshToken;
}