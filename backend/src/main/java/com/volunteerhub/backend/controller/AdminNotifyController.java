package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.AdminNotifyRequest;
import com.volunteerhub.backend.service.impl.WebPushAsyncService;
import com.volunteerhub.backend.service.IAuditService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

/**
 * Admin endpoints to trigger notifications manually.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminNotifyController {

    private final JdbcTemplate jdbcTemplate;
    private final WebPushAsyncService webPushAsyncService;
    private final IAuditService auditService;

    public AdminNotifyController(JdbcTemplate jdbcTemplate, WebPushAsyncService webPushAsyncService, IAuditService auditService) {
        this.jdbcTemplate = jdbcTemplate;
        this.webPushAsyncService = webPushAsyncService;
        this.auditService = auditService;
    }

    /**
     * POST /api/admin/notifyUser
     * Body: { userId, title, message, link?, type? }
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifyUser")
    public ResponseEntity<?> notifyUser(@Valid @RequestBody AdminNotifyRequest req, Authentication auth) {
        // insert into notifications table directly
        String sql = "INSERT INTO notifications (user_id, type, title, message, payload, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Object payloadObj = null;
        try {
            // payload left null for now; you might want to include structured payload
            jdbcTemplate.update(sql, req.getUserId(),
                    req.getType() == null ? "admin" : req.getType(),
                    req.getTitle(),
                    req.getMessage(),
                    null,
                    req.getLink(),
                    false,
                    Timestamp.from(Instant.now())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to insert notification", "details", ex.getMessage()));
        }

        // audit log
        try {
            auditService.log(auth, "admin:notify_user", Map.of("targetUserId", req.getUserId(), "title", req.getTitle()));
        } catch (Exception ignore) {}

        // send push asynchronously to user's subscriptions (non-blocking)
        webPushAsyncService.sendPushToUserAsync(req.getUserId(), req.getTitle(), req.getMessage(), null, req.getLink());

        return ResponseEntity.ok(Map.of("message", "notification_created_and_push_enqueued"));
    }
}
