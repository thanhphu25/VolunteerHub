package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing audit log entries.
 * Provides standard CRUD and query operations on audit records.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
}
