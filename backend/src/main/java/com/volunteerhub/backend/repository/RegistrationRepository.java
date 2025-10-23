package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<RegistrationEntity, Long> {
    Optional<RegistrationEntity> findByEventAndVolunteer(EventEntity event, UserEntity volunteer);
    List<RegistrationEntity> findByEvent(EventEntity event);
    List<RegistrationEntity> findByVolunteer(UserEntity volunteer);
    
    @Query("SELECT r FROM RegistrationEntity r " +
           "JOIN FETCH r.event e " +
           "JOIN FETCH r.volunteer v " +
           "WHERE e.id = :eventId AND v.id = :volunteerId")
    Optional<RegistrationEntity> findByEventIdAndVolunteerIdWithDetails(@Param("eventId") Long eventId, @Param("volunteerId") Long volunteerId);
    
    // Fallback method without JOIN FETCH for debugging
    @Query("SELECT r FROM RegistrationEntity r " +
           "WHERE r.event.id = :eventId AND r.volunteer.id = :volunteerId")
    Optional<RegistrationEntity> findByEventIdAndVolunteerIdSimple(@Param("eventId") Long eventId, @Param("volunteerId") Long volunteerId);
}
