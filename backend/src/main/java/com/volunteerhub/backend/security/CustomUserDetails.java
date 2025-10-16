package com.volunteerhub.backend.security;

import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements org.springframework.security.core.userdetails.UserDetails {

    private final UserEntity user;

    public CustomUserDetails(UserEntity user) { this.user = user; }

    public UserEntity getUserEntity() { return user; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = "ROLE_" + user.getRole().name().toUpperCase();
        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return !"locked".equalsIgnoreCase(user.getStatus()); }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return !"locked".equalsIgnoreCase(user.getStatus()) && !Boolean.TRUE.equals(user.getIsDeleted()); }
}
