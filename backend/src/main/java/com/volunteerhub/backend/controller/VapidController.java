package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.config.WebPushConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expose VAPID public key to client. No auth necessary.
 */
@RestController
public class VapidController {

    private final WebPushConfig webPushConfig;

    public VapidController(WebPushConfig webPushConfig) {
        this.webPushConfig = webPushConfig;
    }

    @GetMapping("/api/push/vapidPublicKey")
    public ResponseEntity<?> getPublicKey() {
        String key = webPushConfig.getPublicKey();
        if (key == null || key.isBlank()) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "VAPID public key not configured"));
        }
        return ResponseEntity.ok(java.util.Map.of("publicKey", key));
    }
}
