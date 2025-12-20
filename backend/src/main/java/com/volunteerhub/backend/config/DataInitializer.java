package com.volunteerhub.backend.config;

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

    // Map để lưu ID tạm từ JSON -> Entity thực tế trong DB
    private final Map<Long, UserEntity> userMap = new HashMap<>();
    private final Map<Long, EventEntity> eventMap = new HashMap<>();
    private final Map<Long, PostEntity> postMap = new HashMap<>(); // ID tạm (trong code) cho Post

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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Chỉ nạp khi bảng User trống
        if (userRepository.count() == 0) {
            System.out.println("Bắt đầu nạp dữ liệu mẫu...");

            // 1. Nạp Users
            try (InputStream inputStream = getClass().getResourceAsStream("/data/users.json")) {
                if (inputStream == null) {
                    System.out.println("Không tìm thấy file users.json!");
                    return;
                }
                List<UserEntity> users = mapper.readValue(inputStream, new TypeReference<List<UserEntity>>() {});

                for (UserEntity user : users) {
                    Long jsonId = user.getId(); // Lưu ID từ JSON
                    user.setId(null); // Reset ID để DB tự sinh

                    // Set mật khẩu mặc định: password123
                    user.setPasswordHash(passwordEncoder.encode("password123"));

                    UserEntity savedUser = userRepository.save(user);
                    userMap.put(jsonId, savedUser); // Map ID JSON -> ID thật
                }
                System.out.println("Đã nạp " + userMap.size() + " users.");
            }

            // 2. Nạp Events
            try (InputStream inputStream = getClass().getResourceAsStream("/data/events.json")) {
                if (inputStream != null) {
                    List<EventJsonDto> eventDtos = mapper.readValue(inputStream, new TypeReference<List<EventJsonDto>>() {});
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
                            eventMap.put(dto.getId(), savedEvent); // Map ID JSON -> Event thật
                        }
                    }
                    System.out.println("Đã nạp " + eventMap.size() + " events.");
                }
            }

            // 3. Nạp Registrations
            try (InputStream inputStream = getClass().getResourceAsStream("/data/registrations.json")) {
                if (inputStream != null) {
                    List<RegistrationJsonDto> regDtos = mapper.readValue(inputStream, new TypeReference<List<RegistrationJsonDto>>() {});
                    int count = 0;
                    for (RegistrationJsonDto dto : regDtos) {
                        RegistrationEntity reg = new RegistrationEntity();

                        UserEntity volunteer = userMap.get(dto.getVolunteerId());
                        EventEntity event = eventMap.get(dto.getEventId());

                        if (volunteer != null && event != null) {
                            reg.setVolunteer(volunteer);
                            reg.setEvent(event);

                            // --- THÊM PHẦN NOTE ---
                            // Đảm bảo entity RegistrationEntity của bạn đã có trường 'note'
                            // reg.setNote(dto.getNote());
                            // ---------------------

                            try {
                                reg.setStatus(RegistrationEntity.RegistrationStatus.valueOf(dto.getStatus()));
                            } catch (Exception e) {
                                reg.setStatus(RegistrationEntity.RegistrationStatus.pending);
                            }

                            registrationRepository.save(reg);
                            count++;
                        }
                    }
                    System.out.println("Đã nạp " + count + " registrations.");
                }
            }

            // 4. Nạp Posts
            try (InputStream inputStream = getClass().getResourceAsStream("/data/posts.json")) {
                if (inputStream != null) {
                    List<PostJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<PostJsonDto>>() {});
                    // Với Posts, JSON của bạn có thể không có ID, hoặc ID không tuần tự
                    // Ta sẽ dùng ID từ JSON nếu có, hoặc tự tạo ID tạm để map với Comment/Like

                    for (PostJsonDto dto : dtos) {
                        PostEntity post = new PostEntity();
                        post.setContent(dto.getContent());
                        post.setImageUrl(dto.getImageUrl());

                        EventEntity event = eventMap.get(dto.getEventId());
                        UserEntity user = userMap.get(dto.getUserId());

                        if (event != null && user != null) {
                            post.setEvent(event);
                            post.setUser(user);
                            post.setLikesCount(0); // Khởi tạo
                            post.setCommentsCount(0); // Khởi tạo

                            PostEntity savedPost = postRepository.save(post);

                            // Nếu JSON có field "id" (cho post), ta dùng nó để map
                            // Nếu không có, ta giả định thứ tự trong file khớp với logic ID tăng dần (khó đảm bảo)
                            // Tốt nhất là thêm field 'id' vào PostJsonDto nếu file JSON có ID
                            if(dto.getId() != null) {
                                postMap.put(dto.getId(), savedPost);
                            } else {
                                // Fallback: Nếu JSON không có ID, ta không thể map comment/like chính xác được
                                // Trừ khi ta tự đặt quy ước ID = thứ tự xuất hiện
                                // Ở đây tôi giả định bạn sẽ thêm field 'id' vào PostJsonDto
                            }
                        }
                    }
                    System.out.println("Đã nạp posts.");
                }
            }

            // 5. Nạp Comments
            try (InputStream inputStream = getClass().getResourceAsStream("/data/comments.json")) {
                if (inputStream != null) {
                    List<CommentJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<CommentJsonDto>>() {});
                    for (CommentJsonDto dto : dtos) {
                        PostCommentEntity comment = new PostCommentEntity();
                        comment.setContent(dto.getContent());

                        PostEntity post = postMap.get(dto.getPostId());
                        UserEntity user = userMap.get(dto.getUserId());

                        if (post != null && user != null) {
                            comment.setPost(post);
                            comment.setUser(user);
                            postCommentRepository.save(comment);

                            // Cập nhật count
                            post.setCommentsCount(post.getCommentsCount() + 1);
                            postRepository.save(post);
                        }
                    }
                    System.out.println("Đã nạp comments.");
                }
            }

            // 6. Nạp Likes (Tên file: post_likes.json)
            try (InputStream inputStream = getClass().getResourceAsStream("/data/post_likes.json")) {
                if (inputStream != null) {
                    List<LikeJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<LikeJsonDto>>() {});
                    for (LikeJsonDto dto : dtos) {
                        PostLikeEntity like = new PostLikeEntity();

                        PostEntity post = postMap.get(dto.getPostId());
                        UserEntity user = userMap.get(dto.getUserId());

                        if (post != null && user != null) {
                            // Kiểm tra trùng lặp
                            if(postLikeRepository.findByPostAndUser(post, user).isEmpty()){
                                like.setPost(post);
                                like.setUser(user);
                                postLikeRepository.save(like);

                                post.setLikesCount(post.getLikesCount() + 1);
                                postRepository.save(post);
                            }
                        }
                    }
                    System.out.println("Đã nạp likes.");
                }
            }

            // 7. Nạp Follows (Tên file: organizer_follows.json)
            try (InputStream inputStream = getClass().getResourceAsStream("/data/organizer_follows.json")) {
                if (inputStream != null) {
                    List<FollowJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<FollowJsonDto>>() {});
                    for (FollowJsonDto dto : dtos) {
                        OrganizerFollowEntity follow = new OrganizerFollowEntity();

                        UserEntity organizer = userMap.get(dto.getOrganizerId());
                        UserEntity follower = userMap.get(dto.getFollowerId());

                        if (organizer != null && follower != null) {
                            // Kiểm tra trùng lặp
                            if (organizerFollowRepository.findByFollowerAndOrganizer(organizer, follower).isEmpty()) {
                                follow.setOrganizer(organizer);
                                follow.setFollower(follower);
                                organizerFollowRepository.save(follow);
                            }
                        }
                    }
                    System.out.println("Đã nạp follows.");
                }
            }

            System.out.println("Hoàn tất nạp dữ liệu mẫu!");
        }
    }

    // --- Inner DTOs ---
    @Data static class EventJsonDto { private Long id; private Long organizerId; private String name; private String category; private String location; private String description; private LocalDateTime startDate; private LocalDateTime endDate; private Integer maxVolunteers; private Integer currentVolunteers; private String status; private String imageUrl; }

    // ĐÃ SỬA: Thêm field "note"
    @Data static class RegistrationJsonDto { private Long eventId; private Long volunteerId; private String status; private String note; }

    // ĐÃ SỬA: Thêm field "id" để map với Comment/Like
    @Data static class PostJsonDto { private Long id; private Long eventId; private Long userId; private String content; private String imageUrl; }

    @Data static class CommentJsonDto { private Long postId; private Long userId; private String content; }
    @Data static class LikeJsonDto { private Long postId; private Long userId; }
    @Data static class FollowJsonDto { private Long organizerId; private Long followerId; }
}