package com.volunteerhub.backend.service;

import org.springframework.security.core.Authentication;

/**
 * Service interface for logging audit events.
 * Records user actions and system-level events with context and metadata.
 */
public interface IAuditService {
    void log(Authentication auth, String action, Object details);

    void logSystem(String action, Object details);
}
