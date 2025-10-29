package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.AuditResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IAuditQueryService {
    Page<AuditResponse> search(String action, Long userId, LocalDateTime from, LocalDateTime to, Pageable pageable);
}
