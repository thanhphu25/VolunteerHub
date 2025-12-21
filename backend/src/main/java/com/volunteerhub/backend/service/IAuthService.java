package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.AuthResponse;
import com.volunteerhub.backend.dto.LoginRequest;
import com.volunteerhub.backend.dto.RegisterRequest;
import com.volunteerhub.backend.entity.UserEntity;

/**
 * Service interface for user authentication and token management.
 * Handles registration, login, token refresh, and logout.
 */
public interface IAuthService {
    UserEntity register(RegisterRequest req);

    UserEntity registerAdmin(RegisterRequest req);

    AuthResponse login(LoginRequest req);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}
