package com.volunteerhub.backend.service.storage;

import com.volunteerhub.backend.exception.FileValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of StorageService for local file system storage.
 * Stores uploaded files on disk with UUID-based naming and validation.
 */
@Service
public class LocalStorageService implements StorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path root;

    private final FileValidationService fileValidationService;

    public LocalStorageService(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    @PostConstruct
    public void init() throws IOException {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty file");
        }

        try {
            if (fileValidationService != null) {
                fileValidationService.validateImage(file);
            }
        } catch (FileValidationException fve) {
            throw new IOException("File validation failed: " + fve.getMessage(), fve);
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = original.lastIndexOf('.');
        if (idx >= 0)
            ext = original.substring(idx);
        String filename = Instant.now().getEpochSecond() + "-" + UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = root.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + filename;
    }

    @Override
    public Path resolve(String relativeUrl) {
        if (relativeUrl == null)
            return null;
        String prefix = "/uploads/";
        if (relativeUrl.startsWith(prefix)) {
            return root.resolve(relativeUrl.substring(prefix.length()));
        }
        return root.resolve(relativeUrl);
    }
}
