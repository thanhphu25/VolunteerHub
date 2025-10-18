package com.volunteerhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Body from client when subscribing to push.
 * Example from browser: { endpoint: "...", keysJson: "{...}" }
 */
@Getter
@Setter
public class PushSubscriptionRequest {
    @NotBlank
    private String endpoint;

    // keys_json as stringified JSON (client should JSON.stringify(subscription.keys) or full subscription)
    private String keysJson;
}
