package com.volunteerhub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Web Push notification settings.
 * Maps properties with the prefix "webpush.vapid" from the application configuration files.
 * These credentials are required to authenticate the application server with push services (FCM, Mozilla, etc.).
 */
@Configuration
@ConfigurationProperties(prefix = "webpush.vapid")
public class WebPushConfig {

    /** The VAPID public key used by the frontend to subscribe the user to push notifications. */
    private String publicKey;

    /** The VAPID private key used by the backend to sign and authorize push messages. */
    private String privateKey;

    /** The subject identifier (usually a mailto: link or a website URL) for the push service contact. */
    private String subject;

    /**
     * Gets the configured VAPID public key.
     * @return The public key string.
     */
    public String getPublicKey() {
        return publicKey;
    }

    /**
     * Sets the VAPID public key.
     * @param publicKey The public key string.
     */
    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    /**
     * Gets the configured VAPID private key.
     * @return The private key string.
     */
    public String getPrivateKey() {
        return privateKey;
    }

    /**
     * Sets the VAPID private key.
     * @param privateKey The private key string.
     */
    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    /**
     * Gets the subject (contact information) for VAPID.
     * @return The subject string (e.g., mailto:example@domain.com).
     */
    public String getSubject() {
        return subject;
    }

    /**
     * Sets the VAPID subject.
     * @param subject The subject string.
     */
    public void setSubject(String subject) {
        this.subject = subject;
    }
}