package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    List<Registration> findByEventId(Long eventId);

    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);
}
