package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.config.WebPushConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for exposing Web Push VAPID configuration.
 * VAPID (Voluntary Application Server Identification) keys are used to identify the 
 * application server to the push service provider.
 */
@RestController
public class VapidController {

    private final WebPushConfig webPushConfig;

    /**
     * Constructs the VapidController with Web Push configuration.
     * @param webPushConfig Configuration component containing VAPID keys.
     */
    public VapidController(WebPushConfig webPushConfig) {
        this.webPushConfig = webPushConfig;
    }

    /**
     * Retrieves the VAPID Public Key required by the frontend to subscribe to push notifications.
     * The client-side (browser) uses this key to encrypt the push subscription.
     * @return A ResponseEntity containing the public key or a 500 error if the key is missing.
     */
    @GetMapping("/api/push/vapidPublicKey")
    public ResponseEntity<?> getPublicKey() {
        String key = webPushConfig.getPublicKey();
        if (key == null || key.isBlank()) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "VAPID public key not configured"));
        }
        return ResponseEntity.ok(java.util.Map.of("publicKey", key));
    }
}