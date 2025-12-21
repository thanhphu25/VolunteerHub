package com.volunteerhub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object representing a system or push notification.
 * This class conveys the notification content and state to the frontend.
 * Fields with null values are excluded from the JSON output to optimize payload size.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    /** The unique identifier of the notification record. */
    private Long id;

    /** * The delivery type of the notification. 
     * e.g., "PUSH", "IN_APP", "EMAIL".
     */
    private String type;

    /** * The functional category of the notification.
     * e.g., "EVENT_UPDATE", "REGISTRATION_APPROVED", "FOLLOW_ALERT".
     */
    private String category;

    /** The brief heading or subject of the notification. */
    private String title;

    /** The detailed body text of the notification message. */
    private String message;

    /** * Raw string-based data payload. 
     * Often used for internal routing or complex data structures in string format.
     */
    private String payload;

    /** * The target URL or internal application route.
     * Directs the user to a specific page (e.g., an event detail page) upon clicking.
     */
    private String link;

    /** * Indicates the read/unread status of the notification.
     * Primarily used for managing the notification badge and history view.
     */
    private Boolean isRead;

    /** The timestamp when the notification was generated. */
    private LocalDateTime createdAt;

    /** * Dynamic metadata associated with the notification.
     * Allows for flexible key-value pairs to support various frontend requirements 
     * without changing the DTO structure.
     */
    private Map<String, Object> meta;
}