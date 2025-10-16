package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequest {
    @NotBlank
    @Size(max = 2000)
    private String content;

    @Size(max = 500)
    private String imageUrl;
}
