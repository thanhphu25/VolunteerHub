package com.volunteerhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class PostLikeResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
}
