package com.volunteerhub.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.backend.entity.AuditLogEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.AuditLogRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.service.IAuditService;
import com.volunteerhub.backend.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuditServiceImpl implements IAuditService {

    private final AuditLogRepository auditRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;
    private final Logger logger = LoggerFactory.getLogger(AuditServiceImpl.class);

    public AuditServiceImpl(AuditLogRepository auditRepo, UserRepository userRepo, ObjectMapper objectMapper) {
        this.auditRepo = auditRepo;
        this.userRepo = userRepo;
        this.objectMapper = objectMapper;
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null) return null;
        if (!(auth.getPrincipal() instanceof CustomUserDetails)) return null;
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        return userRepo.findById(cud.getUserEntity().getId()).orElse(null);
    }

    @Override
    @Transactional
    public void log(Authentication auth, String action, Object details) {
        try {
            UserEntity user = currentUser(auth);
            AuditLogEntity e = new AuditLogEntity();
            e.setUser(user);
            e.setAction(action);
            if (details != null) {
                e.setDetails(objectMapper.writeValueAsString(details));
            }
            auditRepo.save(e);
        } catch (Exception ex) {
            logger.warn("Failed to write audit log: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void logSystem(String action, Object details) {
        try {
            AuditLogEntity e = new AuditLogEntity();
            e.setAction(action);
            if (details != null) e.setDetails(objectMapper.writeValueAsString(details));
            auditRepo.save(e);
        } catch (Exception ex) {
            logger.warn("Failed to write system audit log: {}", ex.getMessage());
        }
    }
}
