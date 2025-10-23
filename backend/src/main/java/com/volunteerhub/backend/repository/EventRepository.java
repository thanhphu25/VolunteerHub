package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface EventRepository extends JpaRepository<EventEntity, Long> {
    Page<EventEntity> findByStatus(EventStatus status, Pageable pageable);
    Page<EventEntity> findByStatusAndIsDeletedFalse(EventStatus status, Pageable pageable);
    Page<EventEntity> findByIsDeletedFalse(Pageable pageable);
    Page<EventEntity> findByOrganizerIdAndIsDeletedFalse(Long organizerId, Pageable pageable);
    
    // Enhanced filtering methods
    Page<EventEntity> findByCategoryContainingIgnoreCaseAndIsDeletedFalse(String category, Pageable pageable);
    Page<EventEntity> findByLocationContainingIgnoreCaseAndIsDeletedFalse(String location, Pageable pageable);
    Page<EventEntity> findByStartDateBetweenAndIsDeletedFalse(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<EventEntity> findByEndDateBetweenAndIsDeletedFalse(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Combined filtering with status
    Page<EventEntity> findByStatusAndCategoryContainingIgnoreCaseAndIsDeletedFalse(EventStatus status, String category, Pageable pageable);
    Page<EventEntity> findByStatusAndLocationContainingIgnoreCaseAndIsDeletedFalse(EventStatus status, String location, Pageable pageable);
    Page<EventEntity> findByStatusAndStartDateBetweenAndIsDeletedFalse(EventStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<EventEntity> findByStatusAndEndDateBetweenAndIsDeletedFalse(EventStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Complex filtering with custom query
    @Query("SELECT e FROM EventEntity e WHERE e.isDeleted = false " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', :category, '%'))) " +
           "AND (:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:startDate IS NULL OR e.startDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.endDate <= :endDate)")
    Page<EventEntity> findEventsWithFilters(
        @Param("status") EventStatus status,
        @Param("category") String category,
        @Param("location") String location,
        @Param("search") String search,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
