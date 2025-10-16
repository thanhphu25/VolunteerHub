package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationCreateRequest {
    @Size(max = 1000)
    private String note;
}
