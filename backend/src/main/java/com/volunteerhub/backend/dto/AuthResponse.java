package com.volunteerhub.backend.dto;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";

    public AuthResponse() {}
    public AuthResponse(String token) { this.accessToken = token; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
}
