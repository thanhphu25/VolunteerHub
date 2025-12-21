package com.volunteerhub.backend.service;

/**
 * Service interface for sending emails.
 * Abstraction layer supporting multiple implementations (console, SMTP, etc.).
 */
public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
