package com.volunteerhub.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Simple JWT authentication filter:
 * - reads Authorization header Bearer <token>
 * - validates with JwtTokenProvider
 * - sets Authentication with role from token claim "role"
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
            try {
                if (jwtTokenProvider.validateToken(token)) {
                    var claims = jwtTokenProvider.getClaims(token);
                    String email = claims.getSubject();
                    Object roleObj = claims.get("role");
                    String role = roleObj == null ? "volunteer" : String.valueOf(roleObj);
                    Object userIdObj = claims.get("userId");
                    Long userId = null;
                    if (userIdObj instanceof Number) userId = ((Number) userIdObj).longValue();

                    // create simple Authentication
                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                    var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                    // attach userId as details for convenience
                    auth.setDetails(Map.of("userId", userId));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ex) {
                // log and continue (unauthenticated)
                logger.debug("JWT validation failed: " + ex.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
