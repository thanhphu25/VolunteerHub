package com.volunteerhub.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for validating file uploads.
 * Enforces file type, size, and format constraints.
 */
public interface FileValidationService {
    void validateImage(MultipartFile file);
}
