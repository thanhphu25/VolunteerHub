package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.AuditResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for querying and exporting audit logs.
 * Supports filtering and pagination for audit trail retrieval.
 */
public interface IAuditQueryService {
    Page<AuditResponse> search(String action, Long userId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<AuditResponse> exportList(String action, Long userId, LocalDateTime from, LocalDateTime to);
}
