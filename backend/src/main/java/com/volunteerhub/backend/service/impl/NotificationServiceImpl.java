package com.volunteerhub.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.backend.dto.NotificationResponse;
import com.volunteerhub.backend.dto.PushSubscriptionRequest;
import com.volunteerhub.backend.entity.NotificationEntity;
import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import com.volunteerhub.backend.repository.NotificationRepository;
import com.volunteerhub.backend.repository.PushSubscriptionRepository;
import com.volunteerhub.backend.service.INotificationService;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.mapper.NotificationMapper;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepo;
    private final PushSubscriptionRepository pushRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;
    private final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepo,
                                   PushSubscriptionRepository pushRepo,
                                   UserRepository userRepo,
                                   ObjectMapper objectMapper,
                                   NotificationMapper notificationMapper) {
        this.notificationRepo = notificationRepo;
        this.pushRepo = pushRepo;
        this.userRepo = userRepo;
        this.objectMapper = objectMapper;
        this.notificationMapper = notificationMapper;
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        return userRepo.findById(cud.getUserEntity().getId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    @Transactional
    public void subscribe(Authentication auth, PushSubscriptionRequest req) {
        UserEntity user = currentUser(auth);

        var existing = pushRepo.findByUserAndEndpoint(user, req.getEndpoint());
        if (existing.isPresent()) {
            PushSubscriptionEntity e = existing.get();
            e.setKeysJson(req.getKeysJson());
            pushRepo.save(e);
            return;
        }

        PushSubscriptionEntity p = new PushSubscriptionEntity();
        p.setUser(user);
        p.setEndpoint(req.getEndpoint());
        p.setKeysJson(req.getKeysJson());
        pushRepo.save(p);
    }

    @Override
    @Transactional
    public void unsubscribe(Authentication auth, PushSubscriptionRequest req) {
        UserEntity user = currentUser(auth);
        pushRepo.deleteByUserAndEndpoint(user, req.getEndpoint());
    }

    @Override
    public List<NotificationResponse> listNotifications(Authentication auth) {
        UserEntity user = currentUser(auth);
        return notificationRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void markAsRead(Authentication auth, Long notificationId) {
        UserEntity user = currentUser(auth);
        NotificationEntity n = notificationRepo.findById(notificationId).orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getUser().getId().equals(user.getId())) throw new SecurityException("Not allowed");
        n.setIsRead(true);
        notificationRepo.save(n);
    }

    @Override
    @Transactional
    public void createNotification(Long userId, String type, String title, String message, String payload, String link) {
        UserEntity user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        NotificationEntity n = new NotificationEntity();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setPayload(payload);
        n.setLink(link);
        n.setIsRead(false);
        notificationRepo.save(n);

        // Try to send Web Push if subscriptions exist (stub)
        try {
            List<PushSubscriptionEntity> subs = pushRepo.findByUser(user);
            for (PushSubscriptionEntity s : subs) {
                boolean ok = sendWebPushIfPossible(s, title, message, payload, link);
                if (!ok) {
                    logger.debug("WebPush not sent for subscription id={}", s.getId());
                }
            }
        } catch (Exception ex) {
            logger.error("Failed to attempt push sends", ex);
        }
    }

    /**
     * Stub for sending Web Push. Right now it logs attempt.
     * To enable real Web Push:
     *  - add a Web Push library (e.g. nl.martijndwars:web-push) to pom,
     *  - configure VAPID keys (public/private) in application.yml,
     *  - perform Web Push encryption and POST to subscription.endpoint with proper headers.
     *
     * Return true if send attempted successfully, false otherwise.
     */
    private boolean sendWebPushIfPossible(PushSubscriptionEntity sub, String title, String message, String payload, String link) {
        // Placeholder — implement with a Web Push library / VAPID config.
        logger.info("Would send web-push to endpoint={} with title='{}' message='{}'", sub.getEndpoint(), title, message);
        // Example: build payload JSON {title, message, link, payload} and call WebPush.send(...)
        return false;
    }
}
