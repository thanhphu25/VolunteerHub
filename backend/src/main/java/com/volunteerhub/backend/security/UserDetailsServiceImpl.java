package com.volunteerhub.backend.security;

import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        String roleName = u.getRole() != null ? u.getRole().name().toUpperCase() : "VOLUNTEER";
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
        return org.springframework.security.core.userdetails.User.builder()
                .username(u.getEmail())
                .password(u.getPasswordHash())
                .authorities(authorities)
                .accountLocked(u.getStatus() == User.Status.locked)
                .disabled(u.getIsDeleted() != null && u.getIsDeleted())
                .build();
    }
}
