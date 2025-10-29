package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.AuditResponse;
import com.volunteerhub.backend.entity.AuditLogEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.AuditLogRepository;
import com.volunteerhub.backend.service.IAuditQueryService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation that builds a dynamic query via Criteria API to support filters.
 */
@Service
public class AuditQueryServiceImpl implements IAuditQueryService {

    private final EntityManager em;
    private final AuditLogRepository auditRepo;

    public AuditQueryServiceImpl(EntityManager em, AuditLogRepository auditRepo) {
        this.em = em;
        this.auditRepo = auditRepo;
    }

    @Override
    public Page<AuditResponse> search(String action, Long userId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<AuditLogEntity> cq = cb.createQuery(AuditLogEntity.class);
        Root<AuditLogEntity> root = cq.from(AuditLogEntity.class);
        // join user (optional)
        Join<AuditLogEntity, UserEntity> userJoin = root.join("user", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        if (action != null && !action.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
        }
        if (userId != null) {
            predicates.add(cb.equal(userJoin.get("id"), userId));
        }
        if (from != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        cq.where(predicates.toArray(new Predicate[0]));
        // default order: createdAt desc
        cq.orderBy(cb.desc(root.get("createdAt")));

        TypedQuery<AuditLogEntity> query = em.createQuery(cq);
        // count total
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<AuditLogEntity> countRoot = countCq.from(AuditLogEntity.class);
        Join<AuditLogEntity, UserEntity> countUserJoin = countRoot.join("user", JoinType.LEFT);
        List<Predicate> countPreds = new ArrayList<>();
        if (action != null && !action.isBlank()) {
            countPreds.add(cb.like(cb.lower(countRoot.get("action")), "%" + action.toLowerCase() + "%"));
        }
        if (userId != null) {
            countPreds.add(cb.equal(countUserJoin.get("id"), userId));
        }
        if (from != null) {
            countPreds.add(cb.greaterThanOrEqualTo(countRoot.get("createdAt"), from));
        }
        if (to != null) {
            countPreds.add(cb.lessThanOrEqualTo(countRoot.get("createdAt"), to));
        }
        countCq.select(cb.count(countRoot)).where(countPreds.toArray(new Predicate[0]));
        Long total = em.createQuery(countCq).getSingleResult();

        // apply paging
        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        query.setFirstResult(pageNumber * pageSize);
        query.setMaxResults(pageSize);

        List<AuditLogEntity> results = query.getResultList();

        // map to DTOs
        List<AuditResponse> content = new ArrayList<>();
        for (AuditLogEntity a : results) {
            Long actorId = null;
            String actorEmail = null;
            UserEntity u = a.getUser();
            if (u != null) {
                actorId = u.getId();
                actorEmail = u.getEmail();
            }
            content.add(new AuditResponse(a.getId(), actorId, actorEmail, a.getAction(), a.getDetails(), a.getCreatedAt()));
        }

        Pageable pg = PageRequest.of(pageNumber, pageSize, pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt"));
        return new PageImpl<>(content, pg, total);
    }
}
