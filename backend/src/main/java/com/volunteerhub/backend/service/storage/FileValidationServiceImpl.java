package com.volunteerhub.backend.service.storage;

import com.volunteerhub.backend.exception.FileValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Default implementation:
 * - allowedTypes: comma separated list like "image/png,image/jpeg,image/webp,image/gif"
 * - if allowedTypes contains "image/*" then accept any image/*
 * - maxSizeBytes in bytes (e.g. 5*1024*1024)
 */
@Service
public class FileValidationServiceImpl implements FileValidationService {

    @Value("${file.allowed-types:image/png,image/jpeg,image/webp,image/gif}")
    private String allowedTypesConfig;

    @Value("${file.max-size-bytes:5242880}") // 5 MB default
    private long maxSizeBytes;

    private Set<String> allowedTypes;
    private boolean allowAnyImageType = false;

    @PostConstruct
    public void init() {
        if (allowedTypesConfig == null || allowedTypesConfig.isBlank()) {
            allowedTypes = Collections.emptySet();
            return;
        }
        Set<String> set = Arrays.stream(allowedTypesConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        this.allowAnyImageType = set.contains("image/*");
        this.allowedTypes = set;
    }

    @Override
    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Empty file");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new FileValidationException("File too large. Max allowed = " + maxSizeBytes + " bytes");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            // try to infer from filename extension as best-effort
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (ext == null || ext.isBlank()) {
                throw new FileValidationException("Unknown file type");
            } else {
                contentType = "application/octet-stream";
            }
        }

        String ct = contentType.toLowerCase(Locale.ROOT);
        if (allowAnyImageType && ct.startsWith("image/")) {
            return;
        }

        if (!allowedTypes.isEmpty()) {
            if (!allowedTypes.contains(ct)) {
                throw new FileValidationException("Invalid file type: " + ct);
            }
        } else {
            // default accept any image/*
            if (!ct.startsWith("image/")) {
                throw new FileValidationException("Only image files are allowed");
            }
        }
    }
}
