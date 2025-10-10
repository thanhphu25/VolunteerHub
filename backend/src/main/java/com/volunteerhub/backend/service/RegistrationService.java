package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.RegistrationDto;
import com.volunteerhub.backend.dto.RegistrationRequest;

import java.util.List;

public interface RegistrationService {
    RegistrationDto register(Long eventId, RegistrationRequest req);
    void unregister(Long eventId, RegistrationRequest req);
    List<RegistrationDto> listByEvent(Long eventId);
    List<RegistrationDto> listByUser(Long userId);

    RegistrationDto approve(Long registrationId);
    RegistrationDto cancel(Long registrationId);
    RegistrationDto complete(Long registrationId);
}
