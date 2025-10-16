package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<RegistrationEntity, Long> {
    Optional<RegistrationEntity> findByEventAndVolunteer(EventEntity event, UserEntity volunteer);
    List<RegistrationEntity> findByEvent(EventEntity event);
    List<RegistrationEntity> findByVolunteer(UserEntity volunteer);
}
