package com.volunteerhub.backend.entity;

/**
 * Lifecycle status of an event.
 * pending → awaiting approval; approved → published;
 * rejected → not approved; cancelled → terminated early;
 * completed → event finished.
 */
public enum EventStatus {
    pending,
    approved,
    rejected,
    cancelled,
    completed
}
