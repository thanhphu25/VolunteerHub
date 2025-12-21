package com.volunteerhub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.backend.dto.AuditResponse;
import com.volunteerhub.backend.service.IAuditQueryService;
import com.volunteerhub.backend.service.IAuditService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * REST controller for administrative audit management.
 * Provides endpoints for searching and exporting system audit logs.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAuditController {

    private final IAuditQueryService auditQueryService;
    private final IAuditService auditService;
    private final ObjectMapper objectMapper;

    /**
     * Constructs a new AdminAuditController with required services.
     * * @param auditQueryService Service for querying audit data.
     * @param auditService Service for logging audit events.
     * @param objectMapper Jackson object mapper for JSON processing.
     */
    public AdminAuditController(IAuditQueryService auditQueryService, IAuditService auditService,
            ObjectMapper objectMapper) {
        this.auditQueryService = auditQueryService;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    /**
     * Retrieves a paginated list of audit logs based on search filters.
     * * @param page Zero-based page index.
     * @param size The size of the page to be returned.
     * @param action Filter by specific action name (optional).
     * @param userId Filter by specific user ID (optional).
     * @param from Start date for the search range (optional).
     * @param to End date for the search range (optional).
     * @param auth Current authentication object.
     * @return A page of AuditResponse objects.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audits")
    public org.springframework.data.domain.Page<com.volunteerhub.backend.dto.AuditResponse> listAudits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        LocalDateTime fromDt = null;
        LocalDateTime toDt = null;
        if (from != null)
            fromDt = from.atStartOfDay();
        if (to != null)
            toDt = to.atTime(LocalTime.MAX);

        var pageReq = org.springframework.data.domain.PageRequest.of(page, size);

        try {
            // Logs the admin's action of viewing audit logs
            auditService.log(auth, "admin:view_audits",
                    java.util.Map.of("page", page, "size", size, "action", action, "userId", userId));
        } catch (Exception ignore) {
        }

        return auditQueryService.search(action, userId, fromDt, toDt, pageReq);
    }

    /**
     * Exports audit logs in the specified format (CSV or JSON).
     * * @param format Output format, either "csv" or "json".
     * @param action Filter by specific action name (optional).
     * @param userId Filter by specific user ID (optional).
     * @param from Start date for the export range (optional).
     * @param to End date for the export range (optional).
     * @param auth Current authentication object.
     * @return A ResponseEntity containing the file bytes or error details.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audits/export")
    public ResponseEntity<?> exportAudits(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        LocalDateTime fromDt = null;
        LocalDateTime toDt = null;
        if (from != null)
            fromDt = from.atStartOfDay();
        if (to != null)
            toDt = to.atTime(LocalTime.MAX);

        try {
            // Logs the admin's action of exporting audit logs
            auditService.log(auth, "admin:export_audits",
                    java.util.Map.of("format", format, "action", action, "userId", userId));
        } catch (Exception ignore) {
        }

        List<AuditResponse> list = auditQueryService.exportList(action, userId, fromDt, toDt);

        try {
            if ("json".equalsIgnoreCase(format)) {
                byte[] bytes = objectMapper.writeValueAsBytes(list);
                String filename = "audits.json";
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(bytes);
            } else {
                String csv = generateCsv(list);
                byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
                String filename = "audits.csv";
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                        .body(bytes);
            }
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Export failed", "details", ex.getMessage()));
        }
    }

    /**
     * Escapes characters for CSV format to handle commas, quotes, and newlines.
     * * @param v Raw string value.
     * @return CSV-safe escaped string.
     */
    private String escapeCsv(String v) {
        if (v == null)
            return "";
        String s = v.replace("\"", "\"\"");
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s + "\"";
        } else {
            return s;
        }
    }

    /**
     * Converts a list of AuditResponse objects into a CSV string.
     * * @param list The data list to be converted.
     * @return A formatted CSV string with headers.
     */
    private String generateCsv(List<AuditResponse> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,userId,userEmail,action,details,createdAt\n");
        for (AuditResponse a : list) {
            sb.append(a.getId() == null ? "" : a.getId()).append(",");
            sb.append(a.getUserId() == null ? "" : a.getUserId()).append(",");
            sb.append(escapeCsv(a.getUserEmail())).append(",");
            sb.append(escapeCsv(a.getAction())).append(",");
            sb.append(escapeCsv(a.getDetails())).append(",");
            sb.append(a.getCreatedAt() == null ? "" : a.getCreatedAt().toString());
            sb.append("\n");
        }
        return sb.toString();
    }
}