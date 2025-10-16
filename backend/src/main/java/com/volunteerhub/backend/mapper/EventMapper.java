package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.entity.EventEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface EventMapper {

    EventEntity toEntity(EventCreateRequest dto);

    @Mapping(target = "organizerId", expression = "java(entity.getOrganizer()!=null ? entity.getOrganizer().getId() : null)")
    @Mapping(target = "organizerName", expression = "java(entity.getOrganizer()!=null ? entity.getOrganizer().getFullName() : null)")
    @Mapping(target = "approvedBy", expression = "java(entity.getApprovedBy()!=null ? entity.getApprovedBy().getId() : null)")
    EventResponse toResponse(EventEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(EventCreateRequest dto, @MappingTarget EventEntity entity);
}
