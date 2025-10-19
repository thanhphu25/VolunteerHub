package com.volunteerhub.backend.service;

import org.springframework.security.core.Authentication;

public interface IAuditService {
    void log(Authentication auth, String action, Object details);
    void logSystem(String action, Object details);
}
