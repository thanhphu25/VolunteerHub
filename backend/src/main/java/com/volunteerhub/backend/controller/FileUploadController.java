package com.volunteerhub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for handling file upload operations.
 * Provides endpoints to store uploaded files locally on the server and return an accessible URL.
 */
@RestController
@RequestMapping("/api")
public class FileUploadController {

    /** Directory where uploaded files will be stored relative to the application root */
    private static final String UPLOAD_DIR = "uploads";

    /**
     * Handles the uploading of a single file via a Multipart request.
     * The file is saved with a unique UUID-based filename to prevent overwriting existing files.
     * * @param file The multipart file received from the client.
     * @return A ResponseEntity containing the relative URL of the uploaded file on success,
     * or an error message with a 500 status code on failure.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Ensure the upload directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Extract file extension from the original filename
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // Generate a unique identifier for the filename
            String uniqueFileName = UUID.randomUUID().toString() + extension;

            // Resolve file path and copy the input stream to the target location
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construct the publicly accessible relative URL
            String fileUrl = "/uploads/" + uniqueFileName;

            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}