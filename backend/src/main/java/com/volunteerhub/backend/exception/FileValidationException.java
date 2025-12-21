package com.volunteerhub.backend.exception;

/**
 * Custom exception thrown when a file upload fails validation checks.
 * This occurs if the uploaded file does not meet the system's requirements 
 * for file type (MIME type), maximum file size, or structural integrity.
 */
public class FileValidationException extends RuntimeException {

    /**
     * Constructs a new FileValidationException with a specific detail message.
     * @param message The detailed reason for the validation failure.
     */
    public FileValidationException(String message) {
        super(message);
    }

    /**
     * Constructs a new FileValidationException with a detail message and a cause.
     * Use this when wrapping an underlying I/O or security exception.
     * @param message The detailed reason for the validation failure.
     * @param cause The underlying throwable that triggered this exception.
     */
    public FileValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}