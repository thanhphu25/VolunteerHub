package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.RegistrationDto;

import java.util.List;

public interface RegistrationService {
    // previous methods retained for admin usage:
    // RegistrationDto register(Long eventId, RegistrationRequest req);
    // void unregister(Long eventId, RegistrationRequest req);

    // New methods using authenticated user id
    RegistrationDto registerByUserId(Long eventId, Long userId);
    void unregisterByUserId(Long eventId, Long userId);

    List<RegistrationDto> listByEvent(Long eventId);
    List<RegistrationDto> listByUser(Long userId);

    RegistrationDto approve(Long registrationId);
    RegistrationDto cancel(Long registrationId);
    RegistrationDto complete(Long registrationId);
}
