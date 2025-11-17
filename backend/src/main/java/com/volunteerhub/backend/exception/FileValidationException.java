package com.volunteerhub.backend.exception;

/**
 * Thrown when an uploaded file is invalid (size/type).
 * It's a RuntimeException so controllers can map it centrally or catch locally.
 */
public class FileValidationException extends RuntimeException {
    public FileValidationException(String message) {
        super(message);
    }

    public FileValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
