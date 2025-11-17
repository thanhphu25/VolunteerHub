package com.volunteerhub.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Abstraction for file storage.
 */
public interface StorageService {
    /**
     * Store file, return public accessible relative URL (e.g. /uploads/abc.png).
     */
    String store(MultipartFile file) throws IOException;

    /**
     * Resolve full disk path for a stored file (for tests/debug).
     */
    Path resolve(String relativeUrl);
}
