package com.volunteerhub.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.backend.config.WebPushConfig;
import com.volunteerhub.backend.entity.PushSubscriptionEntity;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.security.Security;
import java.util.Map;

/**
 * Robust WebPushService: try multiple send(...) signatures and only use Notification constructor
 * by reflection as last resort. This avoids compile/runtime errors on different library versions.
 */
@Service
public class WebPushService {

    private final WebPushConfig webPushConfig;
    private final ObjectMapper objectMapper;
    private Object pushService; // hold PushService instance as Object for reflection
    private final Logger logger = LoggerFactory.getLogger(WebPushService.class);

    public WebPushService(WebPushConfig webPushConfig, ObjectMapper objectMapper) {
        this.webPushConfig = webPushConfig;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        try {
            String pub = webPushConfig.getPublicKey();
            String priv = webPushConfig.getPrivateKey();
            String subject = webPushConfig.getSubject();

            PushService ps = new PushService();
            this.pushService = ps;

            if (pub != null && priv != null && !pub.isBlank() && !priv.isBlank()) {
                ps.setPublicKey(pub);
                ps.setPrivateKey(priv);
                ps.setSubject(subject != null ? subject : "mailto:admin@volunteerhub.test");
                logger.info("WebPushService initialized with VAPID keys.");
            } else {
                logger.warn("WebPush VAPID keys not configured - push sends will be skipped.");
            }
        } catch (Throwable ex) {
            logger.error("Failed to initialize WebPushService", ex);
            this.pushService = null;
        }
    }

    /**
     * Send a web push for the given subscription entity.
     * Returns true when a send attempt was invoked without throwing exception.
     */
    public boolean sendPush(PushSubscriptionEntity subEntity, String title, String message, String payloadJson, String url) {
        if (subEntity == null || subEntity.getEndpoint() == null) {
            logger.debug("Subscription entity or endpoint is null.");
            return false;
        }
        if (this.pushService == null) {
            logger.warn("PushService not initialized (missing VAPID keys or init failure). Skipping push send.");
            return false;
        }

        try {
            // parse subscription keysJson robustly
            String keysJson = subEntity.getKeysJson();
            String p256dh = null;
            String auth = null;
            if (keysJson != null && !keysJson.isBlank()) {
                JsonNode node = objectMapper.readTree(keysJson);
                if (node.has("p256dh") && node.has("auth")) {
                    p256dh = node.get("p256dh").asText();
                    auth = node.get("auth").asText();
                } else if (node.has("keys")) {
                    JsonNode keys = node.get("keys");
                    if (keys.has("p256dh")) p256dh = keys.get("p256dh").asText();
                    if (keys.has("auth")) auth = keys.get("auth").asText();
                } else if (node.has("subscription") && node.get("subscription").has("keys")) {
                    JsonNode keys = node.get("subscription").get("keys");
                    if (keys.has("p256dh")) p256dh = keys.get("p256dh").asText();
                    if (keys.has("auth")) auth = keys.get("auth").asText();
                }
            }

            if (p256dh == null || auth == null) {
                logger.warn("Subscription keys missing (p256dh/auth). keysJson={}", keysJson);
                return false;
            }

            // prepare subscription object
            Subscription.Keys keys = new Subscription.Keys(p256dh, auth);
            Subscription subscription = new Subscription(subEntity.getEndpoint(), keys);

            Map<String, Object> payloadMap = Map.of(
                    "title", title,
                    "message", message,
                    "url", url == null ? "" : url,
                    "payload", payloadJson == null ? "" : payloadJson
            );

            // prepare both byte[] and String payloads
            byte[] payloadBytes = objectMapper.writeValueAsBytes(payloadMap);
            String payloadString = objectMapper.writeValueAsString(payloadMap);

            Class<?> svcClass = this.pushService.getClass();

            // 1) Try send(Subscription, byte[])
            try {
                Method m = svcClass.getMethod("send", Subscription.class, byte[].class);
                m.invoke(this.pushService, subscription, payloadBytes);
                logger.info("WebPush send attempted using send(Subscription, byte[]) for endpoint={}", subEntity.getEndpoint());
                return true;
            } catch (NoSuchMethodException nsme) {
                logger.debug("send(Subscription, byte[]) not available: {}", nsme.getMessage());
            }

            // 2) Try send(Subscription, String)
            try {
                Method m2 = svcClass.getMethod("send", Subscription.class, String.class);
                m2.invoke(this.pushService, subscription, payloadString);
                logger.info("WebPush send attempted using send(Subscription, String) for endpoint={}", subEntity.getEndpoint());
                return true;
            } catch (NoSuchMethodException nsme2) {
                logger.debug("send(Subscription, String) not available: {}", nsme2.getMessage());
            }

            // 3) Try other overloads that take Subscription + something
            for (Method method : svcClass.getMethods()) {
                if (!method.getName().equals("send")) continue;
                Class<?>[] params = method.getParameterTypes();
                if (params.length == 2 && Subscription.class.isAssignableFrom(params[0])) {
                    // second param could be byte[] or String or Object - try byte[] then String
                    try {
                        if (params[1].isAssignableFrom(byte[].class)) {
                            method.invoke(this.pushService, subscription, payloadBytes);
                            logger.info("WebPush send attempted using fallback send(Subscription, byte[])");
                            return true;
                        } else if (params[1].isAssignableFrom(String.class)) {
                            method.invoke(this.pushService, subscription, payloadString);
                            logger.info("WebPush send attempted using fallback send(Subscription, String)");
                            return true;
                        }
                    } catch (Throwable ignore) {
                        // try next
                    }
                }
            }

            // 4) As last resort: try to build a Notification instance by reflection (various ctor signatures),
            // then invoke send(Notification) if available.
            try {
                Class<?> notificationClass = Class.forName("nl.martijndwars.webpush.Notification");
                Constructor<?>[] ctors = notificationClass.getConstructors();
                Object notificationInstance = null;
                for (Constructor<?> ctor : ctors) {
                    Class<?>[] params = ctor.getParameterTypes();
                    if (params.length == 2 && Subscription.class.isAssignableFrom(params[0])) {
                        if (params[1].isAssignableFrom(byte[].class)) {
                            notificationInstance = ctor.newInstance(subscription, payloadBytes);
                            break;
                        } else if (params[1].isAssignableFrom(String.class)) {
                            notificationInstance = ctor.newInstance(subscription, payloadString);
                            break;
                        }
                    } else if (params.length == 1 && Subscription.class.isAssignableFrom(params[0])) {
                        // try single arg ctor
                        notificationInstance = ctor.newInstance(subscription);
                        break;
                    }
                }
                if (notificationInstance != null) {
                    // find send(Notification) method
                    try {
                        Method mSendNotif = svcClass.getMethod("send", notificationInstance.getClass());
                        mSendNotif.invoke(this.pushService, notificationInstance);
                        logger.info("WebPush send attempted using send(Notification) for endpoint={}", subEntity.getEndpoint());
                        return true;
                    } catch (NoSuchMethodException nsme) {
                        // maybe send expects nl.martijndwars.webpush.Notification (class equality)
                        for (Method method : svcClass.getMethods()) {
                            if (!method.getName().equals("send")) continue;
                            Class<?>[] params = method.getParameterTypes();
                            if (params.length == 1 && params[0].isAssignableFrom(notificationInstance.getClass())) {
                                try {
                                    method.invoke(this.pushService, notificationInstance);
                                    logger.info("WebPush send attempted using fallback send(Notification)");
                                    return true;
                                } catch (Throwable ignore) { }
                            }
                        }
                    }
                }
            } catch (ClassNotFoundException cnfe) {
                logger.debug("Notification class not found for reflective construction: {}", cnfe.getMessage());
            } catch (Throwable t) {
                logger.debug("Reflection attempt to construct Notification failed: {}", t.getMessage());
            }

            // None matched - log available send signatures for debugging
            StringBuilder sb = new StringBuilder();
            sb.append("Available send methods on PushService: ");
            for (Method method : svcClass.getMethods()) {
                if (method.getName().equals("send")) {
                    sb.append("(");
                    Class<?>[] ps = method.getParameterTypes();
                    for (int i = 0; i < ps.length; i++) {
                        sb.append(ps[i].getSimpleName());
                        if (i < ps.length - 1) sb.append(",");
                    }
                    sb.append(") ");
                }
            }
            logger.warn("No compatible send(...) method found. {}", sb.toString());
            return false;

        } catch (Throwable ex) {
            logger.warn("Failed to send web push to endpoint=" + subEntity.getEndpoint(), ex);
            return false;
        }
    }
}
