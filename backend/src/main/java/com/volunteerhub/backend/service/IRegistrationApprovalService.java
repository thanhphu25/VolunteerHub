package com.volunteerhub.backend.service;

/**
 * Service interface for approving volunteer event registrations.
 * Handles registration approval workflow and notifications.
 */
public interface IRegistrationApprovalService {
    void approveRegistration(Long registrationId, Long approverId) throws Exception;
}
