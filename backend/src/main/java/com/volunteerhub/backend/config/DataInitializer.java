package com.volunteerhub.backend.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.volunteerhub.backend.entity.*;
import com.volunteerhub.backend.repository.*;
import lombok.Data;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Component responsible for initializing the database with sample data on application startup.
 * It reads data from JSON files located in 'src/main/resources/data' and populates
 * users, events, registrations, posts, comments, likes, and follows.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final PostLikeRepository postLikeRepository;
    private final OrganizerFollowRepository organizerFollowRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper mapper;

    // Temporary maps to maintain relationships between JSON IDs and generated Database IDs
    private final Map<Long, UserEntity> userMap = new HashMap<>();
    private final Map<Long, EventEntity> eventMap = new HashMap<>();
    private final Map<Long, PostEntity> postMap = new HashMap<>();

    /**
     * Constructs the DataInitializer with all required repositories.
     * Initializes the Jackson ObjectMapper with JavaTimeModule to handle LocalDateTime fields.
     */
    public DataInitializer(UserRepository userRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            PostRepository postRepository,
            PostCommentRepository postCommentRepository,
            PostLikeRepository postLikeRepository,
            OrganizerFollowRepository organizerFollowRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.postLikeRepository = postLikeRepository;
        this.organizerFollowRepository = organizerFollowRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    /**
     * Executes the data seeding logic if the database is currently empty.
     * Processes JSON files in a specific order to satisfy foreign key constraints.
     * @param args Command line arguments.
     * @throws Exception If file reading or database persistence fails.
     */
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Starting sample data loading (with password reset)...");

            // 1. Seed Users
            try (InputStream inputStream = getClass().getResourceAsStream("/data/users.json")) {
                if (inputStream == null) {
                    System.out.println("users.json not found!");
                    return;
                }
                List<UserJsonDto> userDtos = mapper.readValue(inputStream, new TypeReference<List<UserJsonDto>>() {
                });

                for (UserJsonDto dto : userDtos) {
                    UserEntity user = new UserEntity();
                    // Mapping fields and encoding default password
                    ObjectMapper tempMapper = new ObjectMapper();
                    tempMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                    String dtoJson = mapper.writeValueAsString(dto);
                    user = tempMapper.readValue(dtoJson, UserEntity.class);

                    user.setId(null);
                    user.setAvatarUrl(dto.getAvatarUrl());
                    user.setPasswordHash(passwordEncoder.encode("password123"));

                    UserEntity savedUser = userRepository.save(user);
                    userMap.put(dto.getId(), savedUser);
                }
                System.out.println("Loaded " + userMap.size() + " users (Password: password123).");
            }

            // 2. Seed Events
            try (InputStream inputStream = getClass().getResourceAsStream("/data/events.json")) {
                if (inputStream != null) {
                    List<EventJsonDto> eventDtos = mapper.readValue(inputStream, new TypeReference<List<EventJsonDto>>() {
                    });
                    for (EventJsonDto dto : eventDtos) {
                        EventEntity event = new EventEntity();
                        event.setName(dto.getName());
                        event.setCategory(dto.getCategory());
                        event.setLocation(dto.getLocation());
                        event.setDescription(dto.getDescription());
                        event.setStartDate(dto.getStartDate());
                        event.setEndDate(dto.getEndDate());
                        event.setMaxVolunteers(dto.getMaxVolunteers());
                        event.setCurrentVolunteers(dto.getCurrentVolunteers());
                        event.setImageUrl(dto.getImageUrl());
                        try {
                            event.setStatus(EventStatus.valueOf(dto.getStatus()));
                        } catch (Exception e) {
                            event.setStatus(EventStatus.pending);
                        }

                        UserEntity organizer = userMap.get(dto.getOrganizerId());
                        if (organizer != null) {
                            event.setOrganizer(organizer);
                            event.setSlug(dto.getName().toLowerCase().replaceAll("[^a-z0-9\\s]", "").replace(" ", "-"));
                            EventEntity savedEvent = eventRepository.save(event);
                            eventMap.put(dto.getId(), savedEvent);
                        }
                    }
                    System.out.println("Loaded " + eventMap.size() + " events.");
                }
            }

            // 3. Seed Registrations
            try (InputStream inputStream = getClass().getResourceAsStream("/data/registrations.json")) {
                if (inputStream != null) {
                    List<RegistrationJsonDto> regDtos = mapper.readValue(inputStream, new TypeReference<List<RegistrationJsonDto>>() {
                    });
                    int count = 0;
                    for (RegistrationJsonDto dto : regDtos) {
                        RegistrationEntity reg = new RegistrationEntity();
                        UserEntity volunteer = userMap.get(dto.getVolunteerId());
                        EventEntity event = eventMap.get(dto.getEventId());
                        if (volunteer != null && event != null) {
                            reg.setVolunteer(volunteer);
                            reg.setEvent(event);
                            reg.setNote(dto.getNote());
                            try {
                                reg.setStatus(RegistrationEntity.RegistrationStatus.valueOf(dto.getStatus()));
                            } catch (Exception e) {
                                reg.setStatus(RegistrationEntity.RegistrationStatus.pending);
                            }
                            registrationRepository.save(reg);
                            count++;
                        }
                    }
                    System.out.println("Loaded " + count + " registrations.");
                }
            }

            // 4. Seed Posts (Discussion Channel)
            try (InputStream inputStream = getClass().getResourceAsStream("/data/posts.json")) {
                if (inputStream != null) {
                    List<PostJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<PostJsonDto>>() {
                    });
                    long tempPostIdCounter = 1;
                    for (PostJsonDto dto : dtos) {
                        PostEntity post = new PostEntity();
                        post.setContent(dto.getContent());
                        post.setImageUrl(dto.getImageUrl());
                        post.setLikesCount(0);
                        post.setCommentsCount(0);

                        EventEntity event = eventMap.get(dto.getEventId());
                        UserEntity user = userMap.get(dto.getUserId());
                        if (event != null && user != null) {
                            post.setEvent(event);
                            post.setUser(user);
                            PostEntity savedPost = postRepository.save(post);
                            postMap.put(tempPostIdCounter++, savedPost);
                        }
                    }
                    System.out.println("Loaded " + postMap.size() + " posts.");
                }
            }

            // 5. Seed Comments on Posts
            try (InputStream inputStream = getClass().getResourceAsStream("/data/comments.json")) {
                if (inputStream != null) {
                    List<CommentJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<CommentJsonDto>>() {
                    });
                    for (CommentJsonDto dto : dtos) {
                        PostCommentEntity comment = new PostCommentEntity();
                        comment.setContent(dto.getContent());
                        PostEntity post = postMap.get(dto.getPostId());
                        UserEntity user = userMap.get(dto.getUserId());
                        if (post != null && user != null) {
                            comment.setPost(post);
                            comment.setUser(user);
                            postCommentRepository.save(comment);

                            post.setCommentsCount(post.getCommentsCount() + 1);
                            postRepository.save(post);
                        }
                    }
                    System.out.println("Loaded comments.");
                }
            }

            // 6. Seed Likes on Posts
            try (InputStream inputStream = getClass().getResourceAsStream("/data/likes.json")) {
                if (inputStream != null) {
                    List<LikeJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<LikeJsonDto>>() {
                    });
                    for (LikeJsonDto dto : dtos) {
                        PostLikeEntity like = new PostLikeEntity();
                        PostEntity post = postMap.get(dto.getPostId());
                        UserEntity user = userMap.get(dto.getUserId());
                        if (post != null && user != null) {
                            if (postLikeRepository.findByPostAndUser(post, user).isEmpty()) {
                                like.setPost(post);
                                like.setUser(user);
                                postLikeRepository.save(like);

                                post.setLikesCount(post.getLikesCount() + 1);
                                postRepository.save(post);
                            }
                        }
                    }
                    System.out.println("Loaded likes.");
                }
            }

            // 7. Seed Follow Relationships
            try (InputStream inputStream = getClass().getResourceAsStream("/data/follows.json")) {
                if (inputStream != null) {
                    List<FollowJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<FollowJsonDto>>() {
                    });
                    for (FollowJsonDto dto : dtos) {
                        OrganizerFollowEntity follow = new OrganizerFollowEntity();
                        UserEntity organizer = userMap.get(dto.getOrganizerId());
                        UserEntity follower = userMap.get(dto.getFollowerId());
                        if (organizer != null && follower != null) {
                            follow.setOrganizer(organizer);
                            follow.setFollower(follower);
                            organizerFollowRepository.save(follow);
                        }
                    }
                    System.out.println("Loaded follows.");
                }
            }

            System.out.println("Sample data initialization complete!");
        }
    }

    /** Data Transfer Objects for JSON Deserialization */

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class UserJsonDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String status;
        @JsonProperty("avatar_url")
        private String avatarUrl;
    }

    @Data
    static class EventJsonDto {
        private Long id;
        private Long organizerId;
        private String name;
        private String category;
        private String location;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer maxVolunteers;
        private Integer currentVolunteers;
        private String status;
        private String imageUrl;
    }

    @Data
    static class RegistrationJsonDto {
        private Long eventId;
        private Long volunteerId;
        private String status;
        private String note;
    }

    @Data
    static class PostJsonDto {
        private Long eventId;
        private Long userId;
        private String content;
        private String imageUrl;
    }

    @Data
    static class CommentJsonDto {
        private Long postId;
        private Long userId;
        private String content;
    }

    @Data
    static class LikeJsonDto {
        private Long postId;
        private Long userId;
    }

    @Data
    static class FollowJsonDto {
        private Long organizerId;
        private Long followerId;
    }
}