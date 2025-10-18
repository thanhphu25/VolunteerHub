package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.dto.PushSubscriptionRequest;
import com.volunteerhub.backend.service.INotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final INotificationService svc;

    public NotificationController(INotificationService svc) {
        this.svc = svc;
    }

    // Subscribe to push (store subscription). Requires authentication.
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/push/subscribe")
    public ResponseEntity<?> subscribe(@Valid @RequestBody PushSubscriptionRequest req, Authentication auth) {
        try {
            svc.subscribe(auth, req);
            return ResponseEntity.ok(java.util.Map.of("message", "subscribed"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    // Unsubscribe
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/push/unsubscribe")
    public ResponseEntity<?> unsubscribe(@Valid @RequestBody PushSubscriptionRequest req, Authentication auth) {
        try {
            svc.unsubscribe(auth, req);
            return ResponseEntity.ok(java.util.Map.of("message", "unsubscribed"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    // List current user's notifications (in-app)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/notifications")
    public ResponseEntity<?> listNotifications(Authentication auth) {
        try {
            List<NotificationResponse> list = svc.listNotifications(auth);
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    // Mark a notification as read
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/notifications/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication auth) {
        try {
            svc.markAsRead(auth, id);
            return ResponseEntity.ok(java.util.Map.of("message", "marked"));
        } catch (SecurityException se) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", se.getMessage()));
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ie.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to mark read"));
        }
    }
}
