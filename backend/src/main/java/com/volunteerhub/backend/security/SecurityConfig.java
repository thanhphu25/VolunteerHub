package com.volunteerhub.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Simple security configuration:
 * - stateless (JWT)
 * - permit /api/v1/auth/** and static resources
 * - require authentication for other endpoints
 * - register JwtAuthenticationFilter (uses only JwtTokenProvider)
 *
 * Note: this class uses the JwtAuthenticationFilter constructor that accepts
 * a single JwtTokenProvider instance (matching the filter in the repo).
 */
@Configuration
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    // If you have a UserDetailsServiceImpl used elsewhere you can inject it,
    // but we do not pass it into the filter here.
    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // ✅ Bean dùng để mã hóa mật khẩu (được inject vào AuthController)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // create filter with single-arg constructor
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtTokenProvider);

        http
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/events/**").authenticated()
                        .anyRequest().authenticated()
                );

        // Add the JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // expose AuthenticationManager if controllers/services need it
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
