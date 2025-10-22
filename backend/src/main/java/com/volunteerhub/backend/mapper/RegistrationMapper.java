package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.RegistrationCreateRequest;
import com.volunteerhub.backend.dto.RegistrationResponse;
import com.volunteerhub.backend.entity.RegistrationEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RegistrationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "volunteer", ignore = true)
    @Mapping(target = "status", expression = "java(com.volunteerhub.backend.entity.RegistrationEntity.RegistrationStatus.pending)")
    @Mapping(target = "registeredAt", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    RegistrationEntity toEntity(RegistrationCreateRequest dto);

    @Mapping(target = "eventId", expression = "java(entity.getEvent().getId())")
    @Mapping(target = "eventName", expression = "java(entity.getEvent().getName())")
    @Mapping(target = "volunteerId", expression = "java(entity.getVolunteer().getId())")
    @Mapping(target = "volunteerName", expression = "java(entity.getVolunteer().getFullName())")
    @Mapping(target = "volunteerEmail", expression = "java(entity.getVolunteer().getEmail())")
    @Mapping(target = "status", expression = "java(entity.getStatus()!=null?entity.getStatus().name():null)")
    @Mapping(target = "attendanceStatus", expression = "java(entity.getAttendanceStatus()!=null?entity.getAttendanceStatus().name():null)")
    RegistrationResponse toResponse(RegistrationEntity entity);
}
