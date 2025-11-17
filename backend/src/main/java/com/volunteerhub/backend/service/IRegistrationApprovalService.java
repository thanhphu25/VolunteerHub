package com.volunteerhub.backend.service;

public interface IRegistrationApprovalService {
    /**
     * Approve registration by id performed by approverId (organizer or admin).
     * Throws IllegalArgumentException for missing data, IllegalStateException for business rule violation.
     */
    void approveRegistration(Long registrationId, Long approverId) throws Exception;
}
