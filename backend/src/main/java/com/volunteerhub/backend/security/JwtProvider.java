package com.volunteerhub.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {

    private final JwtProperties properties;
    private final Key key;

    public JwtProvider(JwtProperties properties) {
        this.properties = properties;
        String secret = properties.getSecret();
        if (secret == null || secret.length() < 32) {
            // For dev convenience; set env JWT_SECRET in real env
            secret = "change_this_to_a_very_long_random_secret_key_for_dev_only";
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateAccessToken(Long userId, String email, String role) {
        long now = System.currentTimeMillis();
        long exp = now + properties.getExpirationMs();
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("typ", "access")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId, String email, String role) {
        long now = System.currentTimeMillis();
        long exp = now + properties.getRefreshExpirationMs();
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("typ", "refresh")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public boolean isRefreshToken(String token) {
        if (!validateToken(token)) return false;
        var claims = getClaims(token);
        String typ = claims.get("typ", String.class);
        return "refresh".equalsIgnoreCase(typ);
    }
}
