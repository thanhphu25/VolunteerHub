package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<RegistrationEntity, Long> {
    Optional<RegistrationEntity> findByEventAndVolunteer(EventEntity event, UserEntity volunteer);
    List<RegistrationEntity> findByEvent(EventEntity event);
    List<RegistrationEntity> findByVolunteer(UserEntity volunteer);
    long countByVolunteerAndStatus(UserEntity volunteer, RegistrationEntity.RegistrationStatus status);
    long countByVolunteerAndStatusIn(UserEntity volunteer, Collection<RegistrationEntity.RegistrationStatus> statuses);
    long countByEventOrganizer(UserEntity organizer);
    long countByEventOrganizerAndStatusIn(UserEntity organizer, Collection<RegistrationEntity.RegistrationStatus> statuses);

    @Query("SELECT COUNT(r) FROM RegistrationEntity r WHERE r.event.organizer = :organizer " +
           "AND (r.event.isDeleted = false OR r.event.isDeleted IS NULL) " +
           "AND r.status IN :statuses")
    long countActiveByOrganizerAndStatusIn(@Param("organizer") UserEntity organizer,
                                           @Param("statuses") Collection<RegistrationEntity.RegistrationStatus> statuses);

    @Query("SELECT COUNT(r) FROM RegistrationEntity r WHERE r.event.organizer = :organizer " +
           "AND (r.event.isDeleted = false OR r.event.isDeleted IS NULL)")
    long countActiveByOrganizer(@Param("organizer") UserEntity organizer);

    @Query("SELECT COUNT(r) FROM RegistrationEntity r WHERE r.volunteer = :volunteer " +
           "AND (r.event.isDeleted = false OR r.event.isDeleted IS NULL) " +
           "AND r.status IN :statuses")
    long countActiveVolunteerRegistrations(@Param("volunteer") UserEntity volunteer,
                                           @Param("statuses") Collection<RegistrationEntity.RegistrationStatus> statuses);

    @Query("SELECT COUNT(r) FROM RegistrationEntity r WHERE r.volunteer = :volunteer " +
           "AND (r.event.isDeleted = false OR r.event.isDeleted IS NULL) " +
           "AND r.status = :status")
    long countActiveVolunteerRegistrationsByStatus(@Param("volunteer") UserEntity volunteer,
                                                   @Param("status") RegistrationEntity.RegistrationStatus status);

    List<RegistrationEntity> findByEventAndStatusIn(EventEntity event, Collection<RegistrationEntity.RegistrationStatus> statuses);

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
