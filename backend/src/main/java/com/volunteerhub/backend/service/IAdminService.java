package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdminService {
    Page<UserResponse> listUsers(Pageable pageable);
    void lockUser(Long userId);
    void unlockUser(Long userId);
    void changeUserRole(Long userId, String role);
    byte[] exportUsers(String format) throws Exception; // "csv" or "json"
    byte[] exportEvents(String format) throws Exception;
}
