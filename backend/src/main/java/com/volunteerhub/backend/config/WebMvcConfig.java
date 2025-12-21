package com.volunteerhub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Advanced Web MVC configuration for the application.
 * This class handles the mapping of static resources, specifically allowing
 * the application to serve files from a configurable external directory.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /** * The directory where files are uploaded, injected from application properties.
     * Defaults to "uploads" if not specified.
     */
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Configures a handler to serve uploaded files via a URL pattern.
     * This implementation resolves the absolute path of the upload directory to ensure
     * cross-platform compatibility and sets a cache period for improved performance.
     * * @param registry The ResourceHandlerRegistry used to define resource mappings.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert the configured upload directory to an absolute, normalized path
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        // Convert the file path to a valid URI string (e.g., file:/C:/path/to/uploads/)
        String resourceLocation = uploadPath.toUri().toString();
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600); // Set browser cache duration to 1 hour (3600 seconds)
    }
}