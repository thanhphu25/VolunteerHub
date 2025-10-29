package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.AuditResponse;
import com.volunteerhub.backend.service.IAuditQueryService;
import com.volunteerhub.backend.service.IAuditService;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Admin controller to view audit logs with filtering and paging.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAuditController {

    private final IAuditQueryService auditQueryService;
    private final IAuditService auditService;

    public AdminAuditController(IAuditQueryService auditQueryService, IAuditService auditService) {
        this.auditQueryService = auditQueryService;
        this.auditService = auditService;
    }

    /**
     * GET /api/admin/audits
     * Query params:
     *  - page (default 0)
     *  - size (default 20)
     *  - action (optional, partial match)
     *  - userId (optional)
     *  - from (optional) format YYYY-MM-DD or ISO datetime
     *  - to (optional) format YYYY-MM-DD or ISO datetime
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audits")
    public Page<AuditResponse> listAudits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth
    ) {
        // convert LocalDate to LocalDateTime range if provided
        LocalDateTime fromDt = null;
        LocalDateTime toDt = null;
        if (from != null) fromDt = from.atStartOfDay();
        if (to != null) toDt = to.atTime(LocalTime.MAX);

        var pageReq = PageRequest.of(page, size);

        // log that admin viewed audits (non-fatal)
        try {
            auditService.log(auth, "admin:view_audits", java.util.Map.of("page", page, "size", size, "action", action, "userId", userId));
        } catch (Exception ignore) {}

        return auditQueryService.search(action, userId, fromDt, toDt, pageReq);
    }
}
