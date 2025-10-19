package com.volunteerhub.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI volunteerHubOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("VolunteerHub API")
                        .description("VolunteerHub — Backend API documentation")
                        .version("v1.0")
                        .contact(new Contact().name("VolunteerHub Team").email("dev@volunteerhub.test")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("volunteerhub-public")
                .packagesToScan("com.volunteerhub.backend.controller")
                .build();
    }
}
