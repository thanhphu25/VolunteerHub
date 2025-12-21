package com.volunteerhub.backend.config;

import com.volunteerhub.backend.security.CustomUserDetailsService;
import com.volunteerhub.backend.security.JwtAuthenticationFilter;
import com.volunteerhub.backend.security.JwtProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Main security configuration for the application.
 * Configures JWT-based authentication, authorization rules for endpoints, 
 * password encoding, and Cross-Origin Resource Sharing (CORS).
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;

    /**
     * Constructs SecurityConfig with required security components.
     * @param uds Service to load user-specific data during authentication.
     * @param jwtProvider Component for generating and validating JWT tokens.
     */
    public SecurityConfig(CustomUserDetailsService uds, JwtProvider jwtProvider) {
        this.userDetailsService = uds;
        this.jwtProvider = jwtProvider;
    }

    /**
     * Configures the security filter chain.
     * Sets up CSRF disablement, endpoint permit/protect rules, and injects 
     * the custom JWT filter before the standard username-password filter.
     * * @param http HttpSecurity object to build the security configuration.
     * @return The built SecurityFilterChain.
     * @throws Exception If an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var jwtFilter = new JwtAuthenticationFilter(jwtProvider, userDetailsService);

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // Disabled for stateless JWT-based APIs

                .authorizeHttpRequests(auth -> auth
                        // Publicly accessible paths
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/upload").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        // Allow all GET requests to API for public viewing
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        // All other requests (POST, PUT, DELETE etc.) require authentication
                        .anyRequest().authenticated())

                // Inject JWT Filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    /**
     * Configures CORS settings for the application.
     * Specifies allowed origins (frontend URLs), methods, and headers.
     * * @return A source providing the CORS configuration for all paths.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Local development frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Defines the password encoder bean using BCrypt hashing algorithm.
     * * @return A BCryptPasswordEncoder with a strength (log rounds) of 12.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Exposes the AuthenticationManager bean to be used in login logic.
     * * @param config Standard authentication configuration.
     * @return The AuthenticationManager instance.
     * @throws Exception If an error occurs retrieving the manager.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}