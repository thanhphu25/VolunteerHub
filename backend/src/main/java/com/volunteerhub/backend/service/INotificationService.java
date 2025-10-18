package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.dto.PushSubscriptionRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface INotificationService {
    void subscribe(Authentication auth, PushSubscriptionRequest req);
    void unsubscribe(Authentication auth, PushSubscriptionRequest req);
    List<NotificationResponse> listNotifications(Authentication auth);
    void markAsRead(Authentication auth, Long notificationId);
    void createNotification(Long userId, String type, String title, String message, String payload, String link);
}
