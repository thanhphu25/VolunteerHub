package com.volunteerhub.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Custom Web MVC configuration for the application.
 * Implements {@link WebMvcConfigurer} to customize the default Spring MVC behavior,
 * specifically for handling static resources and file uploads.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configures the ResourceHandler to serve static files from the local file system.
     * This method maps the URL pattern "/uploads/**" to the physical "uploads/" 
     * directory located at the root of the project.
     * * Example: A file stored at "./uploads/my-image.jpg" will be accessible via 
     * "http://localhost:8080/uploads/my-image.jpg".
     * * @param registry The ResourceHandlerRegistry used to register the resource handler.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}