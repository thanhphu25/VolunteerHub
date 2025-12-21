package com.volunteerhub.backend.mapper;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.entity.EventEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Mapper interface for converting event-related objects.
 * Transforms between {@link EventCreateRequest}, {@link EventEntity}, and {@link EventResponse}
 * using MapStruct for compile-time type-safe mapping.
 */
@Mapper(componentModel = "spring")
public interface EventMapper {

    /**
     * Converts an event creation or update request DTO into a persistent entity.
     *
     * @param dto the data transfer object containing event details.
     * @return a new {@link EventEntity} populated with the DTO values.
     */
    EventEntity toEntity(EventCreateRequest dto);

    /**
     * Maps an {@link EventEntity} to an {@link EventResponse} DTO.
     * Resolves nested associations (Organizer and Approver) to extract specific IDs and names.
     * Also converts the Status enum to its string representation.
     *
     * @param entity the source persistent entity from the database.
     * @return a fully populated {@link EventResponse}.
     */
    @Mapping(target = "organizerId", expression = "java(entity.getOrganizer()!=null ? entity.getOrganizer().getId() : null)")
    @Mapping(target = "organizerName", expression = "java(entity.getOrganizer()!=null ? entity.getOrganizer().getFullName() : null)")
    @Mapping(target = "status", expression = "java(entity.getStatus()!=null ? entity.getStatus().name() : null)")
    @Mapping(target = "approvedBy", expression = "java(entity.getApprovedBy()!=null ? entity.getApprovedBy().getId() : null)")
    EventResponse toResponse(EventEntity entity);

    /**
     * Updates an existing {@link EventEntity} with values from an {@link EventCreateRequest}.
     * Uses an "Ignore Null" strategy, meaning null DTO fields will not overwrite existing data.
     * Ideal for partial updates (PATCH requests).
     *
     * @param dto the source DTO containing updated fields.
     * @param entity the target entity to be updated in place.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(EventCreateRequest dto, @MappingTarget EventEntity entity);
}