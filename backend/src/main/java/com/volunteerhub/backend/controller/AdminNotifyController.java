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
 * Controller responsible for administrative notification operations.
 * Allows administrators to send direct system notifications and web push alerts to users.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminNotifyController {

    private final JdbcTemplate jdbcTemplate;
    private final WebPushAsyncService webPushAsyncService;
    private final IAuditService auditService;

    /**
     * Constructs the AdminNotifyController with database, push, and audit services.
     * * @param jdbcTemplate The JDBC template for direct database interaction.
     * @param webPushAsyncService Service for handling asynchronous web push notifications.
     * @param auditService Service for logging administrative audit trails.
     */
    public AdminNotifyController(JdbcTemplate jdbcTemplate, WebPushAsyncService webPushAsyncService,
            IAuditService auditService) {
        this.jdbcTemplate = jdbcTemplate;
        this.webPushAsyncService = webPushAsyncService;
        this.auditService = auditService;
    }

    /**
     * Sends a notification to a specific user.
     * This method saves the notification to the database, logs the admin action,
     * and triggers an asynchronous web push notification.
     * * @param req The notification details including target user ID, title, and message.
     * @param auth The current security authentication context.
     * @return A ResponseEntity indicating whether the notification was successfully processed.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifyUser")
    public ResponseEntity<?> notifyUser(@Valid @RequestBody AdminNotifyRequest req, Authentication auth) {
        String sql = "INSERT INTO notifications (user_id, type, title, message, payload, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Object payloadObj = null;
        try {
            // Persist the notification in the database
            jdbcTemplate.update(sql, req.getUserId(),
                    req.getType() == null ? "admin" : req.getType(),
                    req.getTitle(),
                    req.getMessage(),
                    null,
                    req.getLink(),
                    false,
                    Timestamp.from(Instant.now()));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to insert notification", "details", ex.getMessage()));
        }

        try {
            // Log the notification event for audit purposes
            auditService.log(auth, "admin:notify_user",
                    Map.of("targetUserId", req.getUserId(), "title", req.getTitle()));
        } catch (Exception ignore) {
        }

        // Trigger asynchronous web push delivery
        webPushAsyncService.sendPushToUserAsync(req.getUserId(), req.getTitle(), req.getMessage(), null, req.getLink());

        return ResponseEntity.ok(Map.of("message", "notification_created_and_push_enqueued"));
    }
}