package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.dto.PushSubscriptionRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

/**
 * Service interface for managing notifications and Web Push subscriptions.
 * Handles subscription lifecycle, notification delivery, and user read status.
 */
public interface INotificationService {
    void subscribe(Authentication auth, PushSubscriptionRequest req);

    void unsubscribe(Authentication auth, PushSubscriptionRequest req);

    List<NotificationResponse> listNotifications(Authentication auth);

    List<NotificationResponse> listFeed(Authentication auth);

    void markAsRead(Authentication auth, Long notificationId);

    void markAllAsRead(Authentication auth);

    void createNotification(Long userId, String type, String title, String message, String payload, String link);
}
