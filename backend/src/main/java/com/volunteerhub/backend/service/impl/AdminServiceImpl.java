package com.volunteerhub.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.mapper.UserMapper;
import com.volunteerhub.backend.service.IAdminService;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.entity.Status;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepo;
    private final EventRepository eventRepo;
    private final ObjectMapper objectMapper;
    private final UserMapper userMapper;

    private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AdminServiceImpl(UserRepository userRepo,
                            EventRepository eventRepo,
                            ObjectMapper objectMapper,
                            UserMapper userMapper) {
        this.userRepo = userRepo;
        this.eventRepo = eventRepo;
        this.objectMapper = objectMapper;
        this.userMapper = userMapper;
    }

    @Override
    public Page<UserResponse> listUsers(Pageable pageable) {
        return userRepo.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public void lockUser(Long userId) {
        UserEntity u = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setStatus(Status.locked);
        userRepo.save(u);
    }

    @Override
    @Transactional
    public void unlockUser(Long userId) {
        UserEntity u = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setStatus(Status.active);
        userRepo.save(u);
    }

    @Override
    @Transactional
    public void changeUserRole(Long userId, String role) {
        UserEntity u = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        // validate role string -> Role enum (volunteer|organizer|admin)
        Role r;
        try {
            r = Role.valueOf(role);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid role");
        }
        u.setRole(r);
        userRepo.save(u);
    }

    @Override
    public byte[] exportUsers(String format) throws Exception {
        List<UserEntity> users = userRepo.findAll();
        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder sb = new StringBuilder();
            sb.append("id,email,full_name,phone,role,status,created_at,last_login\n");
            for (UserEntity u : users) {
                sb.append(u.getId()).append(",");
                sb.append(escapeCsv(u.getEmail())).append(",");
                sb.append(escapeCsv(u.getFullName())).append(",");
                sb.append(escapeCsv(u.getPhone())).append(",");
                sb.append(u.getRole()!=null?u.getRole().toString():"").append(",");
                sb.append(u.getStatus()!=null?u.getStatus().toString():"").append(",");
                sb.append(u.getCreatedAt()!=null?dtf.format(u.getCreatedAt()):"").append(",");
                sb.append(u.getLastLogin()!=null?dtf.format(u.getLastLogin()):"").append("\n");
            }
            return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } else { // default json
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(
                    users.stream().map(userMapper::toResponse).collect(Collectors.toList())
            );
        }
    }

    @Override
    public byte[] exportEvents(String format) throws Exception {
        List<EventEntity> events = eventRepo.findAll();
        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder sb = new StringBuilder();
            sb.append("id,name,category,location,start_date,end_date,status,organizer_email,organizer_name,created_at,approved_at\n");
            for (EventEntity e : events) {
                sb.append(e.getId()).append(",");
                sb.append(escapeCsv(e.getName())).append(",");
                sb.append(escapeCsv(e.getCategory())).append(",");
                sb.append(escapeCsv(e.getLocation())).append(",");
                sb.append(e.getStartDate()!=null?dtf.format(e.getStartDate()):"").append(",");
                sb.append(e.getEndDate()!=null?dtf.format(e.getEndDate()):"").append(",");
                sb.append(e.getStatus()!=null?e.getStatus().toString():"").append(",");
                sb.append(e.getOrganizer()!=null?escapeCsv(e.getOrganizer().getEmail()):"").append(",");
                sb.append(e.getOrganizer()!=null?escapeCsv(e.getOrganizer().getFullName()):"").append(",");
                sb.append(e.getCreatedAt()!=null?dtf.format(e.getCreatedAt()):"").append(",");
                sb.append(e.getApprovedAt()!=null?dtf.format(e.getApprovedAt()):"").append("\n");
            }
            return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } else {
            // map to lightweight JSON objects
            var list = events.stream().map(e -> {
                java.util.Map<String,Object> m = new java.util.HashMap<>();
                m.put("id", e.getId());
                m.put("name", e.getName());
                m.put("category", e.getCategory());
                m.put("location", e.getLocation());
                m.put("startDate", e.getStartDate());
                m.put("endDate", e.getEndDate());
                m.put("status", e.getStatus()!=null?e.getStatus().toString():null);
                m.put("organizerEmail", e.getOrganizer()!=null?e.getOrganizer().getEmail():null);
                m.put("organizerName", e.getOrganizer()!=null?e.getOrganizer().getFullName():null);
                m.put("createdAt", e.getCreatedAt());
                m.put("approvedAt", e.getApprovedAt());
                return m;
            }).collect(Collectors.toList());
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(list);
        }
    }

    private String escapeCsv(String s) {
        if (s == null) return "";
        String out = s.replace("\"", "\"\"");
        if (out.contains(",") || out.contains("\"") || out.contains("\n")) {
            return "\"" + out + "\"";
        }
        return out;
    }
}
