package com.volunteerhub.backend.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Thêm import này
import com.fasterxml.jackson.annotation.JsonProperty;       // Thêm import này
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

    private final Map<Long, UserEntity> userMap = new HashMap<>();
    private final Map<Long, EventEntity> eventMap = new HashMap<>();
    private final Map<Long, PostEntity> postMap = new HashMap<>();

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
            System.out.println("Bắt đầu nạp dữ liệu mẫu (Có reset mật khẩu)...");

            // 1. Nạp Users
            try (InputStream inputStream = getClass().getResourceAsStream("/data/users.json")) {
                if (inputStream == null) {
                    System.out.println("Không tìm thấy file users.json!");
                    return;
                }

                // --- THAY ĐỔI Ở ĐÂY: Dùng UserJsonDto thay vì UserEntity trực tiếp ---
                List<UserJsonDto> userDtos = mapper.readValue(inputStream, new TypeReference<List<UserJsonDto>>() {});

                for (UserJsonDto dto : userDtos) {
                    UserEntity user = new UserEntity();

                    // Copy dữ liệu từ DTO sang Entity thủ công
                    user.setFullName(dto.getFullName());
                    user.setEmail(dto.getEmail());
                    user.setPhone(dto.getPhone());

                    // Xử lý avatarUrl từ DTO
                    user.setAvatarUrl(dto.getAvatarUrl());

                    // Set các trường mặc định hoặc logic riêng
                    user.setPasswordHash(passwordEncoder.encode("password123"));

                    // Xử lý Role (Giả sử Role trong Entity là String hoặc Enum khớp với JSON)
                    // Nếu Role là Enum, bạn cần user.setRole(RoleEnum.valueOf(dto.getRole()));
                    // Ở đây tôi để mặc định gán thẳng string nếu Entity dùng String,
                    // hoặc bạn tự điều chỉnh nếu dùng Enum.
                    try {
                        // Nếu Role trong Entity là Enum, hãy uncomment dòng dưới và sửa cho khớp
                        // user.setRole(UserEntity.Role.valueOf(dto.getRole().toUpperCase()));

                        // Nếu Role là String:
                        // user.setRole(dto.getRole());

                        // TẠM THỜI: Tôi giả định cơ chế map cũ của bạn hoạt động,
                        // nhưng vì tôi không thấy file UserEntity, tôi sẽ dùng cách an toàn nhất:
                        // Bạn hãy kiểm tra file UserEntity của bạn, nếu Role là Enum thì phải parse.
                        // Dưới đây là ví dụ gán tạm nếu bạn dùng Enum UserRole:
                         /* if (dto.getRole() != null) {
                            user.setRole(UserRole.valueOf(dto.getRole().toUpperCase()));
                         }
                         */
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    // Vì tôi không thấy class UserEntity, tôi sẽ dùng cách Mapper để copy các field trùng tên
                    // sau đó ghi đè avatarUrl. Đây là cách 'lười' nhưng hiệu quả nếu field khớp nhau:
                    // Tuy nhiên, để code chạy chắc chắn 100%, tôi khuyên dùng set thủ công như trên.
                    // Dưới đây là code set thủ công tiếp tục cho các field cơ bản:

                    // Lưu ý: Đoạn này bạn cần điều chỉnh setRole/setStatus theo đúng kiểu dữ liệu trong UserEntity của bạn
                    // Ví dụ nếu Status là String:
                    // user.setStatus(dto.getStatus());

                    // --- QUAN TRỌNG: CÁCH AN TOÀN NHẤT ĐỂ COPY MÀ KHÔNG CẦN BIẾT RÕ ENTITY ---
                    // Chúng ta dùng lại mapper để convert ngược từ DTO sang Entity,
                    // nhưng trước đó phải set avatarUrl vào đúng chỗ

                    UserEntity tempUser = new UserEntity();
                    tempUser.setFullName(dto.getFullName());
                    tempUser.setEmail(dto.getEmail());
                    tempUser.setPhone(dto.getPhone());
                    tempUser.setAvatarUrl(dto.getAvatarUrl()); // Đã lấy được từ JSON
                    tempUser.setPasswordHash(passwordEncoder.encode("password123"));

                    // Map Role và Status thủ công tùy vào kiểu dữ liệu của bạn
                    // Ví dụ giả định:
                    // tempUser.setRole(dto.getRole());
                    // tempUser.setStatus(dto.getStatus());

                    // Vì không thấy UserEntity, tôi sẽ dùng cách hack này:
                    // Convert DTO -> JSON String -> UserEntity.
                    // Nhưng UserEntity không có @JsonProperty("avatar_url"), nên ta set tay.

                    // === CHỐT PHƯƠNG ÁN: COPY THỦ CÔNG CÁC TRƯỜNG CẦN THIẾT ===
                    // Bạn hãy đảm bảo UserEntity có các hàm set tương ứng

                    // 1. Ánh xạ các trường cơ bản
                    // (Sử dụng ObjectMapper để convert phần chung, bỏ qua lỗi)
                    ObjectMapper tempMapper = new ObjectMapper();
                    tempMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                    String dtoJson = mapper.writeValueAsString(dto);
                    user = tempMapper.readValue(dtoJson, UserEntity.class);

                    // 2. Set lại cái quan trọng nhất: Avatar và Password
                    user.setId(null); // Đảm bảo tạo mới
                    user.setAvatarUrl(dto.getAvatarUrl());
                    user.setPasswordHash(passwordEncoder.encode("password123"));

                    UserEntity savedUser = userRepository.save(user);
                    userMap.put(dto.getId(), savedUser);
                }
                System.out.println("Đã nạp " + userMap.size() + " users (Mật khẩu: password123).");
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
                            eventMap.put(dto.getId(), savedEvent);
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
                    System.out.println("Đã nạp " + count + " registrations.");
                }
            }

            // 4. Nạp Posts
            try (InputStream inputStream = getClass().getResourceAsStream("/data/posts.json")) {
                if (inputStream != null) {
                    List<PostJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<PostJsonDto>>() {});
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
                    System.out.println("Đã nạp " + postMap.size() + " posts.");
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

                            post.setCommentsCount(post.getCommentsCount() + 1);
                            postRepository.save(post);
                        }
                    }
                    System.out.println("Đã nạp comments.");
                }
            }

            // 6. Nạp Likes
            try (InputStream inputStream = getClass().getResourceAsStream("/data/likes.json")) {
                if (inputStream != null) {
                    List<LikeJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<LikeJsonDto>>() {});
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
                    System.out.println("Đã nạp likes.");
                }
            }

            // 7. Nạp Follows
            try (InputStream inputStream = getClass().getResourceAsStream("/data/follows.json")) {
                if (inputStream != null) {
                    List<FollowJsonDto> dtos = mapper.readValue(inputStream, new TypeReference<List<FollowJsonDto>>() {});
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
                    System.out.println("Đã nạp follows.");
                }
            }

            System.out.println("Hoàn tất nạp dữ liệu mẫu!");
        }
    }

    // --- Inner DTOs ---

    // 1. Thêm Class DTO mới này để hứng dữ liệu User từ JSON
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true) // Bỏ qua các trường thừa nếu có
    static class UserJsonDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String status;

        // Đây là chìa khóa: Ánh xạ "avatar_url" từ JSON vào biến avatarUrl
        @JsonProperty("avatar_url")
        private String avatarUrl;
    }

    @Data static class EventJsonDto { private Long id; private Long organizerId; private String name; private String category; private String location; private String description; private LocalDateTime startDate; private LocalDateTime endDate; private Integer maxVolunteers; private Integer currentVolunteers; private String status; private String imageUrl; }
    @Data static class RegistrationJsonDto { private Long eventId; private Long volunteerId; private String status; private String note; }
    @Data static class PostJsonDto { private Long eventId; private Long userId; private String content; private String imageUrl; }
    @Data static class CommentJsonDto { private Long postId; private Long userId; private String content; }
    @Data static class LikeJsonDto { private Long postId; private Long userId; }
    @Data static class FollowJsonDto { private Long organizerId; private Long followerId; }
}