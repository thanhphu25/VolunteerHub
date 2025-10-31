package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
    // Standard repository; filtering done via Criteria API in service
}
