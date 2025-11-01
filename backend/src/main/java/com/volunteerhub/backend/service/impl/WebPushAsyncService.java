package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import com.volunteerhub.backend.repository.PushSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class WebPushAsyncService {

    private final WebPushService webPushService;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ExecutorService executor;
    private final Logger logger = LoggerFactory.getLogger(WebPushAsyncService.class);

    public WebPushAsyncService(WebPushService webPushService, PushSubscriptionRepository pushSubscriptionRepository) {
        this.webPushService = webPushService;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        // thread pool for sending pushes; tune size as needed
        this.executor = Executors.newFixedThreadPool(4);
    }

    /**
     * Send a notification to all subscriptions of a user asynchronously.
     * This method returns immediately; sends happen on thread-pool.
     */
    public void sendPushToUserAsync(Long userId, String title, String message, String payloadJson, String url) {
        if (userId == null) return;
        List<PushSubscriptionEntity> subs = pushSubscriptionRepository.findByUserId(userId);
        if (subs == null || subs.isEmpty()) {
            logger.info("No push subscriptions for userId={}", userId);
            return;
        }

        for (PushSubscriptionEntity sub : subs) {
            CompletableFuture.runAsync(() -> sendAndCleanup(sub, title, message, payloadJson, url), executor)
                    .exceptionally(ex -> {
                        logger.warn("Push send task failed for userId={}, endpoint={}", userId, sub.getEndpoint(), ex);
                        return null;
                    });
        }
    }

    private void sendAndCleanup(PushSubscriptionEntity sub, String title, String message, String payloadJson, String url) {
        try {
            int status = webPushService.sendPushReturnStatus(sub, title, message, payloadJson, url);
            // if subscription not usable: HTTP 404 (Not Found) or 410 (Gone) -> delete it
            if (status == 404 || status == 410) {
                try {
                    pushSubscriptionRepository.delete(sub);
                    logger.info("Deleted expired push subscription id={} endpoint={}", sub.getId(), sub.getEndpoint());
                } catch (Exception ex) {
                    logger.warn("Failed to delete expired push subscription id=" + sub.getId(), ex);
                }
            } else if (status == -1) {
                logger.debug("Push send returned error (-1) for endpoint {}", sub.getEndpoint());
            } else {
                logger.debug("Push sent with status {} for endpoint {}", status, sub.getEndpoint());
            }
        } catch (Exception ex) {
            logger.warn("Exception while sending push", ex);
        }
    }
}
