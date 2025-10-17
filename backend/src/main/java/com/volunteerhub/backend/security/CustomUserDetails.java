package com.volunteerhub.backend.security;

import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.entity.Status;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * CustomUserDetails — wrapper around com.volunteerhub.entity.UserEntity
 */
public class CustomUserDetails implements UserDetails {

    private final UserEntity userEntity;

    public CustomUserDetails(UserEntity userEntity) {
        this.userEntity = userEntity;
    }

    public UserEntity getUserEntity() {
        return userEntity;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Role r = userEntity.getRole();
        String roleName = (r != null) ? r.name() : "volunteer";
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return userEntity.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return userEntity.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        Status s = userEntity.getStatus();
        // if status enum present, check locked; if null treat as active
        return s == null || s != Status.locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        Status s = userEntity.getStatus();
        Boolean deleted = userEntity.getIsDeleted();
        boolean notDeleted = deleted == null ? true : !deleted;
        return (s == null || s == Status.active) && notDeleted;
    }
}
