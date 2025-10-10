package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.volunteerhub.backend.security.UserDetailsImpl;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lấy thông tin người dùng hiện tại
    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
