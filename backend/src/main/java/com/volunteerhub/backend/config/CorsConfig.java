package com.volunteerhub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Global Cross-Origin Resource Sharing (CORS) configuration.
 * This class defines how the backend handles requests coming from different domains (e.g., a React or Angular frontend).
 */
@Configuration
public class CorsConfig {

    /**
     * Configures a CorsFilter bean to allow cross-origin requests.
     * Settings are currently permissive to facilitate development, allowing all origins, headers, and methods.
     * * @return A configured {@link CorsFilter} with specified CORS rules.
     */
    @Bean
    public CorsFilter corsFilter() {
        var config = new CorsConfiguration();
        
        // Allows the browser to send credentials like cookies or Authorization headers
        config.setAllowCredentials(true);
        
        // Allows requests from any origin (using pattern matching for flexibility)
        config.addAllowedOriginPattern("*");
        
        // Allows all HTTP headers in the request
        config.addAllowedHeader("*");
        
        // Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");
        
        // Ensures the "Authorization" header is accessible to the client-side code
        config.addExposedHeader("Authorization");

        var source = new UrlBasedCorsConfigurationSource();
        // Applies this CORS configuration to all paths in the application
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}