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

/**
 * Controller for managing user notifications and Web Push subscriptions.
 * Provides endpoints to handle subscription lifecycle and notification reading status.
 */
@RestController
@RequestMapping("/api")
public class NotificationController {

    private final INotificationService svc;

    /**
     * Constructs the NotificationController with the notification service.
     * @param svc Service handling notification delivery and state management.
     */
    public NotificationController(INotificationService svc) {
        this.svc = svc;
    }

    /**
     * Registers a Web Push subscription for the authenticated user.
     * This allows the server to send push notifications to the user's browser/device.
     * @param req The subscription details (endpoint, keys) from the browser.
     * @param auth Current authentication context.
     * @return ResponseEntity confirming the subscription.
     */
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

    /**
     * Removes a Web Push subscription for the authenticated user.
     * @param req The subscription details to be removed.
     * @param auth Current authentication context.
     * @return ResponseEntity confirming the unsubscription.
     */
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

    /**
     * Retrieves all notifications for the currently authenticated user.
     * @param auth Current authentication context.
     * @return List of notifications wrapped in NotificationResponse objects.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationResponse>> listNotifications(Authentication auth) {
        try {
            return ResponseEntity.ok(svc.listNotifications(auth));
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Retrieves a feed of notifications, often filtered or prioritized for the user.
     * @param auth Current authentication context.
     * @return List of notifications for the feed.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/notifications/feed")
    public ResponseEntity<List<NotificationResponse>> feed(Authentication auth) {
        try {
            return ResponseEntity.ok(svc.listFeed(auth));
        } catch (Exception ex) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Marks a specific notification as read.
     * @param id The ID of the notification to update.
     * @param auth Current authentication context.
     * @return ResponseEntity confirming the update, or error if not found/unauthorized.
     */
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

    /**
     * Marks all notifications belonging to the authenticated user as read.
     * @param auth Current authentication context.
     * @return ResponseEntity confirming the bulk update.
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/notifications/read-all")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        try {
            svc.markAllAsRead(auth);
            return ResponseEntity.ok(java.util.Map.of("message", "all_marked"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to mark all read"));
        }
    }
}