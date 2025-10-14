package com.volunteerhub.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long jwtExpirationMs;

    public JwtTokenProvider(@Value("${jwt.secret:}") String jwtSecret,
                            @Value("${jwt.expirationMs:86400000}") long jwtExpirationMs) {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            // dev fallback (make sure to provide a real secret in prod)
            jwtSecret = "change_this_to_a_very_long_random_secret_key_for_dev_only_123456";
        }
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs <= 0 ? 86400000L : jwtExpirationMs;
    }

    public String generateToken(String email, String role, Long userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        // IMPORTANT: don't call setClaims() after setSubject() — it would overwrite subject.
        return Jwts.builder()
                .setSubject(email)                        // subject kept
                .claim("role", role == null ? "" : role) // add custom claim(s)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // optional: log ex.getMessage() for debugging
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }
}
