package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for administrative operations.
 * Provides user management, role changes, account locking, and data export.
 */
public interface IAdminService {
    Page<UserResponse> listUsers(Pageable pageable);

    void lockUser(Long userId);

    void unlockUser(Long userId);

    void changeUserRole(Long userId, String role);

    byte[] exportUsers(String format) throws Exception;

    byte[] exportEvents(String format) throws Exception;
}
