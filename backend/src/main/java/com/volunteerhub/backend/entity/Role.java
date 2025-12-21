package com.volunteerhub.backend.entity;

/**
 * Application roles assigned to users.
 * `volunteer` → participates in events;
 * `organizer` → manages events;
 * `admin` → oversees the system.
 */
public enum Role {
    volunteer,
    organizer,
    admin
}
