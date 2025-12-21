package com.volunteerhub.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Service interface for file storage operations.
 * Abstraction layer supporting local and cloud storage implementations.
 */
public interface StorageService {
    String store(MultipartFile file) throws IOException;

    Path resolve(String relativeUrl);
}
