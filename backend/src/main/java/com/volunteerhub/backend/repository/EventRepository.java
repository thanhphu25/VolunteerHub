package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for querying and managing volunteer events.
 * Supports filtering by status, category, location, dates, organizer,
 * and comprehensive full-text search with pagination.
 */
@Repository
public interface EventRepository extends JpaRepository<EventEntity, Long> {
        Page<EventEntity> findByStatus(EventStatus status, Pageable pageable);

        Page<EventEntity> findByStatusAndIsDeletedFalse(EventStatus status, Pageable pageable);

        Page<EventEntity> findByIsDeletedFalse(Pageable pageable);

        Page<EventEntity> findByOrganizerIdAndIsDeletedFalse(Long organizerId, Pageable pageable);

        long countByStatusAndIsDeletedFalse(EventStatus status);

        long countByIsDeletedFalseAndEndDateBefore(LocalDateTime date);

        long countByIsDeletedFalseAndStartDateGreaterThan(LocalDateTime date);

        long countByIsDeletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDateTime start,
                        LocalDateTime end);

        long countByOrganizerAndIsDeletedFalse(UserEntity organizer);

        long countByOrganizerAndStatusAndIsDeletedFalse(UserEntity organizer, EventStatus status);

        long countByIsDeletedTrue();

        Page<EventEntity> findByCategoryContainingIgnoreCaseAndIsDeletedFalse(String category, Pageable pageable);

        Page<EventEntity> findByLocationContainingIgnoreCaseAndIsDeletedFalse(String location, Pageable pageable);

        Page<EventEntity> findByStartDateBetweenAndIsDeletedFalse(LocalDateTime startDate, LocalDateTime endDate,
                        Pageable pageable);

        Page<EventEntity> findByEndDateBetweenAndIsDeletedFalse(LocalDateTime startDate, LocalDateTime endDate,
                        Pageable pageable);

        Page<EventEntity> findByStatusAndCategoryContainingIgnoreCaseAndIsDeletedFalse(EventStatus status,
                        String category, Pageable pageable);

        Page<EventEntity> findByStatusAndLocationContainingIgnoreCaseAndIsDeletedFalse(EventStatus status,
                        String location, Pageable pageable);

        Page<EventEntity> findByStatusAndStartDateBetweenAndIsDeletedFalse(EventStatus status, LocalDateTime startDate,
                        LocalDateTime endDate, Pageable pageable);

        Page<EventEntity> findByStatusAndEndDateBetweenAndIsDeletedFalse(EventStatus status, LocalDateTime startDate,
                        LocalDateTime endDate, Pageable pageable);

        @Query("SELECT e FROM EventEntity e WHERE e.isDeleted = false " +
                        "AND (:status IS NULL OR e.status = :status) " +
                        "AND (:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', :category, '%'))) " +
                        "AND (:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                        "AND (:organizerId IS NULL OR e.organizer.id = :organizerId) " +
                        "AND (:organizerName IS NULL OR LOWER(e.organizer.fullName) LIKE LOWER(CONCAT('%', :organizerName, '%'))) "
                        +
                        "AND (:search IS NULL OR (LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))) " +
                        "AND (:startDate IS NULL OR e.endDate >= :startDate) " +
                        "AND (:endDate IS NULL OR e.startDate <= :endDate) " +
                        "AND (:timeStatus IS NULL OR (" +
                        " (LOWER(:timeStatus) = 'ended' AND e.endDate < :now) OR " +
                        " (LOWER(:timeStatus) = 'ongoing' AND e.startDate <= :now AND e.endDate >= :now) OR " +
                        " (LOWER(:timeStatus) = 'upcoming' AND e.startDate > :now)" +
                        "))")
        Page<EventEntity> findEventsWithFilters(
                        @Param("status") EventStatus status,
                        @Param("category") String category,
                        @Param("location") String location,
                        @Param("organizerId") Long organizerId,
                        @Param("organizerName") String organizerName,
                        @Param("search") String search,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("timeStatus") String timeStatus,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);

        @Query(value = "SELECT e.id             AS event_id,\n" +
                        "       e.name           AS event_name,\n" +
                        "       e.created_at     AS created_at,\n" +
                        "       COALESCE(r.reg_count, 0)   AS registrations,\n" +
                        "       COALESCE(c.comment_count, 0) AS comments\n" +
                        "FROM events e\n" +
                        "         LEFT JOIN (SELECT event_id, COUNT(*) AS reg_count\n" +
                        "                    FROM registrations\n" +
                        "                    WHERE status IN ('approved', 'completed')\n" +
                        "                    GROUP BY event_id) r ON r.event_id = e.id\n" +
                        "         LEFT JOIN (SELECT p.event_id, COUNT(*) AS comment_count\n" +
                        "                    FROM post_comments pc\n" +
                        "                             JOIN posts p ON pc.post_id = p.id\n" +
                        "                    WHERE pc.is_deleted = false\n" +
                        "                    GROUP BY p.event_id) c ON c.event_id = e.id\n" +
                        "WHERE (e.is_deleted = false OR e.is_deleted IS NULL)\n" +
                        "ORDER BY registrations DESC, comments DESC, e.created_at DESC\n" +
                        "LIMIT :limit", nativeQuery = true)
        List<EventLeaderboardProjection> findTopEvents(@Param("limit") int limit);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.organizer = :organizer")
        long countActiveByOrganizer(@Param("organizer") UserEntity organizer);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.organizer = :organizer AND e.status = :status")
        long countActiveByOrganizerAndStatus(@Param("organizer") UserEntity organizer,
                        @Param("status") EventStatus status);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.status = :status")
        long countActiveByStatus(@Param("status") EventStatus status);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.endDate < :date")
        long countActiveEndedBefore(@Param("date") LocalDateTime date);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.startDate > :date")
        long countActiveStartingAfter(@Param("date") LocalDateTime date);

        @Query("SELECT COUNT(e) FROM EventEntity e WHERE (e.isDeleted = false OR e.isDeleted IS NULL) AND e.startDate <= :moment AND e.endDate >= :moment")
        long countActiveOngoing(@Param("moment") LocalDateTime moment);

        @Query("SELECT e FROM EventEntity e " +
                        "LEFT JOIN PostEntity p ON p.event = e " +
                        "WHERE e.status = com.volunteerhub.backend.entity.EventStatus.approved " +
                        "AND (e.isDeleted = false OR e.isDeleted IS NULL) " +
                        "GROUP BY e " +
                        "ORDER BY ( " +
                        "   (e.currentVolunteers * 3) + " +
                        "   COALESCE(SUM(p.likesCount), 0) + " +
                        "   (COALESCE(SUM(p.commentsCount), 0) * 2) " +
                        ") DESC")
        List<EventEntity> findTrendingEvents(Pageable pageable);

        @Query("SELECT e FROM EventEntity e " +
                        "LEFT JOIN PostEntity p ON p.event = e " +
                        "WHERE e.isDeleted = false " +
                        "AND (:status IS NULL OR e.status = :status) " +
                        "AND (:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', :category, '%'))) " +
                        "AND (:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                        "AND (:organizerId IS NULL OR e.organizer.id = :organizerId) " +
                        "AND (:organizerName IS NULL OR LOWER(e.organizer.fullName) LIKE LOWER(CONCAT('%', :organizerName, '%'))) "
                        +
                        "AND (:search IS NULL OR (LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))) " +
                        "AND (:startDate IS NULL OR e.endDate >= :startDate) " +
                        "AND (:endDate IS NULL OR e.startDate <= :endDate) " +
                        "AND (:timeStatus IS NULL OR (" +
                        " (LOWER(:timeStatus) = 'ended' AND e.endDate < :now) OR " +
                        " (LOWER(:timeStatus) = 'ongoing' AND e.startDate <= :now AND e.endDate >= :now) OR " +
                        " (LOWER(:timeStatus) = 'upcoming' AND e.startDate > :now)" +
                        ")) " +
                        "GROUP BY e " +
                        "ORDER BY ((e.currentVolunteers * 3) + COALESCE(SUM(p.likesCount), 0) + (COALESCE(SUM(p.commentsCount), 0) * 2)) DESC")
        Page<EventEntity> findEventsWithFiltersAndPopularity(
                        @Param("status") EventStatus status,
                        @Param("category") String category,
                        @Param("location") String location,
                        @Param("organizerId") Long organizerId,
                        @Param("organizerName") String organizerName,
                        @Param("search") String search,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("timeStatus") String timeStatus,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);

        @Query("SELECT e as event, GREATEST(e.createdAt, COALESCE(MAX(p.createdAt), e.createdAt)) as lastActivity " +
                        "FROM EventEntity e " +
                        "LEFT JOIN PostEntity p ON p.event = e " +
                        "WHERE e.isDeleted = false " +
                        "AND (:status IS NULL OR e.status = :status) " +
                        "AND (:category IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', :category, '%'))) " +
                        "AND (:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                        "AND (:organizerId IS NULL OR e.organizer.id = :organizerId) " +
                        "AND (:organizerName IS NULL OR LOWER(e.organizer.fullName) LIKE LOWER(CONCAT('%', :organizerName, '%'))) "
                        +
                        "AND (:search IS NULL OR (LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))) " +
                        "AND (:startDate IS NULL OR e.endDate >= :startDate) " +
                        "AND (:endDate IS NULL OR e.startDate <= :endDate) " +
                        "AND (:timeStatus IS NULL OR (" +
                        " (LOWER(:timeStatus) = 'ended' AND e.endDate < :now) OR " +
                        " (LOWER(:timeStatus) = 'ongoing' AND e.startDate <= :now AND e.endDate >= :now) OR " +
                        " (LOWER(:timeStatus) = 'upcoming' AND e.startDate > :now)" +
                        ")) " +
                        "GROUP BY e " +
                        "ORDER BY GREATEST(e.createdAt, COALESCE(MAX(p.createdAt), e.createdAt)) DESC")
        Page<EventWithActivityProjection> findEventsWithFiltersAndRecentActivity(
                        @Param("status") EventStatus status,
                        @Param("category") String category,
                        @Param("location") String location,
                        @Param("organizerId") Long organizerId,
                        @Param("organizerName") String organizerName,
                        @Param("search") String search,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("timeStatus") String timeStatus,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);
}