package com.volunteerhub.backend.dto;

public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private String avatarUrl;
    private String bio;

    public UserResponse() {}

    public UserResponse(Long id, String email, String fullName, String phone, String role, String status, String avatarUrl, String bio) {
        this.id = id; this.email = email; this.fullName = fullName; this.phone = phone; this.role = role; this.status = status; this.avatarUrl = avatarUrl; this.bio = bio;
    }

    // getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getBio() { return bio; }
}
