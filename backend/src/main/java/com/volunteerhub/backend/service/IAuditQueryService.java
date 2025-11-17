package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.AuditResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface IAuditQueryService {
    Page<AuditResponse> search(String action, Long userId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    /**
     * Return all matching audit entries (unpaged) for export purposes.
     */
    List<AuditResponse> exportList(String action, Long userId, LocalDateTime from, LocalDateTime to);
}
