package com.volunteerhub.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service để validate file upload trước khi lưu.
 */
public interface FileValidationService {
    /**
     * Validate file as an image according to configured rules.
     * Throws com.volunteerhub.backend.exception.FileValidationException on failure.
     */
    void validateImage(MultipartFile file);
}
