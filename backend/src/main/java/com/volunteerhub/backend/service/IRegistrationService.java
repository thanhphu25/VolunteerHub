package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.RegistrationCreateRequest;
import com.volunteerhub.backend.dto.RegistrationResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface IRegistrationService {
    RegistrationResponse register(Long eventId, RegistrationCreateRequest req, Authentication auth);
    RegistrationResponse cancel(Long eventId, Long registrationId, Authentication auth);
    List<RegistrationResponse> listForEvent(Long eventId, Authentication auth);
    List<RegistrationResponse> listForVolunteer(Authentication auth);
    RegistrationResponse getRegistrationByEventAndVolunteer(Long eventId, Authentication auth);
    RegistrationResponse approve(Long eventId, Long registrationId, Authentication auth);
    RegistrationResponse reject(Long eventId, Long registrationId, Authentication auth);
    RegistrationResponse markCompleted(Long eventId, Long registrationId, boolean present, String completionNote, Authentication auth);
}
