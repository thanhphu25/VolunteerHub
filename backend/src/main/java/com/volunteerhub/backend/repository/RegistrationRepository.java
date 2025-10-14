package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.model.Registration;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

//    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    Optional<Registration> findByEventIdAndVolunteerId(Long eventId, Long volunteerId);

    Page<Registration> findByVolunteerId(Long volunteerId, Pageable pageable);

    Page<Registration> findByEventId(Long eventId, Pageable pageable);
}
