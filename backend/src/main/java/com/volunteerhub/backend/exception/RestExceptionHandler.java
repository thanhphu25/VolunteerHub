package com.volunteerhub.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Global exception handler for the REST API.
 * This class intercepts specific exceptions thrown by any controller and 
 * formats them into standard HTTP response entities, ensuring a unified 
 * error response structure for the frontend.
 */
@RestControllerAdvice
public class RestExceptionHandler {

    /**
     * Handles validation errors triggered by @Valid or @Validated annotations.
     * Extracts field-level errors (e.g., "email must not be blank") and aggregates 
     * them into a map for the client.
     * * @param ex The validation exception containing binding results.
     * @return A 400 Bad Request response containing a map of field names and error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors()
                .stream().collect(Collectors.toMap(
                        err -> err.getField(),
                        err -> err.getDefaultMessage(),
                        (a, b) -> a + "; " + b));
        return ResponseEntity.badRequest().body(java.util.Map.of("errors", errors));
    }

    /**
     * Handles database-related constraint violations, such as unique key conflicts 
     * (e.g., trying to register an email that already exists).
     * * @param ex The data integrity exception thrown by the persistence layer.
     * @return A 409 Conflict response with a generic error message.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(java.util.Map.of("error", "Database constraint violation"));
    }

    /**
     * Fallback handler for all unexpected exceptions.
     * Ensures that the server does not crash and provides a 500 status code 
     * with the exception's message to aid in debugging.
     * * @param ex The unhandled exception.
     * @return A 500 Internal Server Error response.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", ex.getMessage()));
    }
}