package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.RegistrationEntity.RegistrationStatus;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.service.IAuditService;
import com.volunteerhub.backend.service.IRegistrationApprovalService;
import jakarta.persistence.OptimisticLockException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Approve registration safely using optimistic locking on EventEntity.version.
 * Retries a few times on OptimisticLockException.
 */
@Service
public class RegistrationApprovalServiceImpl implements IRegistrationApprovalService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final IAuditService auditService;
    private final Logger logger = LoggerFactory.getLogger(RegistrationApprovalServiceImpl.class);

    private static final int MAX_RETRIES = 3;

    public RegistrationApprovalServiceImpl(RegistrationRepository registrationRepository,
                                           EventRepository eventRepository,
                                           IAuditService auditService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.auditService = auditService;
    }

    @Override
    public void approveRegistration(Long registrationId, Long approverId) throws Exception {
        int attempts = 0;
        while (true) {
            attempts++;
            try {
                doApproveTransactional(registrationId, approverId);
                return; // success
            } catch (OptimisticLockException ole) {
                logger.warn("Optimistic lock on approveRegistration id={} attempt={}", registrationId, attempts);
                if (attempts >= MAX_RETRIES) {
                    throw new IllegalStateException("Conflict while approving registration. Please try again.", ole);
                }
                try { Thread.sleep(50L * attempts); } catch (InterruptedException ignored) {}
                // retry
            }
        }
    }

    @Transactional
    public void doApproveTransactional(Long registrationId, Long approverId) {
        RegistrationEntity reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found: " + registrationId));

        // ensure it's still pending
        if (reg.getStatus() != RegistrationStatus.pending) {
            throw new IllegalStateException("Registration is not pending (current=" + reg.getStatus() + ")");
        }

        EventEntity event = reg.getEvent();
        if (event == null) {
            throw new IllegalArgumentException("Event not found for registration " + registrationId);
        }

        Integer max = event.getMaxVolunteers();
        Integer current = event.getCurrentVolunteers() == null ? 0 : event.getCurrentVolunteers();

        if (max != null && current >= max) {
            throw new IllegalStateException("Event is full. maxVolunteers=" + max);
        }

        // increment and persist event
        event.setCurrentVolunteers(current + 1);
        eventRepository.save(event); // version checked at commit

        // update registration
        reg.setStatus(RegistrationStatus.approved);
        reg.setApprovedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        // audit log (if available)
        try {
            auditService.log(null, "registration:approve", java.util.Map.of(
                    "registrationId", registrationId,
                    "eventId", event.getId(),
                    "approverId", approverId
            ));
        } catch (Exception ex) {
            logger.debug("Audit log failed", ex);
        }
    }
}
