-- V1__init.sql
-- VolunteerHub initial schema for MySQL (compatible with Flyway)
-- Note: Triggers are placed in triggers.sql and must be applied manually if desired.

-- Drop existing tables (safe for fresh recreate)
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Roles table
CREATE TABLE roles (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name) VALUES ('admin'), ('organizer'), ('volunteer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Users table
CREATE TABLE users (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       phone VARCHAR(20),
                       role ENUM('volunteer','organizer','admin') NOT NULL DEFAULT 'volunteer',
                       status ENUM('active','locked') NOT NULL DEFAULT 'active',
                       avatar_url VARCHAR(500),
                       bio TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       last_login TIMESTAMP NULL,
                       INDEX idx_email (email),
                       INDEX idx_role (role),
                       INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE events (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        organizer_id INT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        category ENUM('environment','charity','education','health','community','other') NOT NULL,
                        location VARCHAR(500) NOT NULL,
                        address TEXT,
                        start_date DATETIME NOT NULL,
                        end_date DATETIME NOT NULL,
                        max_volunteers INT DEFAULT NULL,
                        current_volunteers INT DEFAULT 0,
                        status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
                        image_url VARCHAR(500),
                        requirements TEXT,
                        benefits TEXT,
                        contact_info VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        approved_at TIMESTAMP NULL,
                        approved_by INT NULL,
                        INDEX idx_organizer (organizer_id),
                        INDEX idx_status (status),
                        INDEX idx_category (category),
                        INDEX idx_start_date (start_date),
                        INDEX idx_created_at (created_at),
                        CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
                        CONSTRAINT fk_events_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations table
CREATE TABLE registrations (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               event_id INT NOT NULL,
                               volunteer_id INT NOT NULL,
                               status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
                               note TEXT,
                               organizer_note TEXT,
                               attendance_status ENUM('absent','present') DEFAULT NULL,
                               completion_note TEXT,
                               registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               approved_at TIMESTAMP NULL,
                               completed_at TIMESTAMP NULL,
                               cancelled_at TIMESTAMP NULL,
                               UNIQUE KEY unique_registration (event_id, volunteer_id),
                               INDEX idx_event (event_id),
                               INDEX idx_volunteer (volunteer_id),
                               INDEX idx_status (status),
                               INDEX idx_registered_at (registered_at),
                               CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                               CONSTRAINT fk_registrations_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts (event wall)
CREATE TABLE posts (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       event_id INT NOT NULL,
                       user_id INT NOT NULL,
                       content TEXT NOT NULL,
                       image_url VARCHAR(500),
                       likes_count INT DEFAULT 0,
                       comments_count INT DEFAULT 0,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       INDEX idx_event (event_id),
                       INDEX idx_user (user_id),
                       INDEX idx_created_at (created_at),
                       CONSTRAINT fk_posts_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                       CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post comments
CREATE TABLE post_comments (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               post_id INT NOT NULL,
                               user_id INT NOT NULL,
                               content TEXT NOT NULL,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               INDEX idx_post (post_id),
                               INDEX idx_user (user_id),
                               INDEX idx_created_at (created_at),
                               CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                               CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post likes
CREATE TABLE post_likes (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            post_id INT NOT NULL,
                            user_id INT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE KEY unique_like (post_id, user_id),
                            INDEX idx_post (post_id),
                            INDEX idx_user (user_id),
                            CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                            CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE notifications (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               user_id INT NOT NULL,
                               type ENUM('registration_approved','registration_rejected','event_approved','event_cancelled','event_reminder','new_post','new_comment','completion_marked') NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               link VARCHAR(500),
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               INDEX idx_user (user_id),
                               INDEX idx_is_read (is_read),
                               INDEX idx_created_at (created_at),
                               CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SAMPLE DATA
INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES
                                                                             ('admin@volunteerhub.com', '$2b$10$examplehashadmin', 'Admin Hệ thống', '0901234567', 'admin', 'active'),
                                                                             ('organizer1@volunteerhub.com', '$2b$10$examplehashorg1', 'Nguyễn Văn A', '0902345678', 'organizer', 'active'),
                                                                             ('organizer2@volunteerhub.com', '$2b$10$examplehashorg2', 'Trần Thị B', '0903456789', 'organizer', 'active'),
                                                                             ('admin@gmail.com', '$2a$10$E6WHzKMt7T8Ey1C0mVDJDeWqv6pLyvImFih8K5btSHb4QmX1TRy6i', 'Admin Hệ thống', '0909000000', 'admin', 'active'),
                                                                             ('user@gmail.com', '$2a$10$E6WHzKMt7T8Ey1C0mVDJDeWqv6pLyvImFih8K5btSHb4QmX1TRy6i', 'Nguyễn Văn User', '0908111222', 'volunteer', 'active');

INSERT INTO events (organizer_id, name, description, category, location, address, start_date, end_date, max_volunteers, status, approved_by) VALUES
                                                                                                                                                 (2, 'Trồng cây xanh vì môi trường', 'Chương trình trồng 500 cây xanh tại công viên Thống Nhất, góp phần cải thiện môi trường sống.', 'environment', 'Công viên Thống Nhất', 'Quận Ba Đình, Hà Nội', '2025-11-15 07:00:00', '2025-11-15 12:00:00', 50, 'approved', 1),
                                                                                                                                                 (2, 'Dọn rác bãi biển Sầm Sơn', 'Hoạt động vệ sinh bãi biển, bảo vệ môi trường biển.', 'environment', 'Bãi biển Sầm Sơn', 'Sầm Sơn, Thanh Hóa', '2025-11-20 06:00:00', '2025-11-20 11:00:00', 100, 'approved', 1),
                                                                                                                                                 (3, 'Tặng quà Trung thu cho trẻ em', 'Trao tặng quà và tổ chức vui chơi cho trẻ em có hoàn cảnh khó khăn.', 'charity', 'Trung tâm Nhi đồng', 'Quận Đống Đa, Hà Nội', '2025-11-25 14:00:00', '2025-11-25 18:00:00', 30, 'approved', 1),
                                                                                                                                                 (3, 'Bình dân học vụ số', 'Dạy tin học cơ bản cho người cao tuổi.', 'education', 'Nhà văn hóa phường', 'Cầu Giấy, Hà Nội', '2025-11-18 08:00:00', '2025-11-18 11:00:00', 20, 'pending', NULL);

INSERT INTO registrations (event_id, volunteer_id, status, note) VALUES
                                                                     (1, 4, 'approved', 'Rất muốn tham gia bảo vệ môi trường'),
                                                                     (1, 5, 'approved', 'Đã có kinh nghiệm trồng cây'),
                                                                     (2, 4, 'pending', 'Mong được tham gia'),
                                                                     (3, 5, 'approved', 'Yêu trẻ em và muốn giúp đỡ các em');

INSERT INTO posts (event_id, user_id, content, likes_count, comments_count) VALUES
                                                                                (1, 2, 'Chào mừng các bạn tham gia sự kiện! Hãy chuẩn bị tinh thần và dụng cụ cá nhân nhé.', 5, 2),
                                                                                (1, 4, 'Rất hào hứng với sự kiện này! Mong các bạn đông đủ.', 3, 1);

INSERT INTO post_comments (post_id, user_id, content) VALUES
                                                          (1, 4, 'Cảm ơn ban tổ chức! Mình sẽ chuẩn bị đầy đủ.'),
                                                          (1, 5, 'Có cần mang theo nước uống không ạ?');

INSERT INTO post_likes (post_id, user_id) VALUES
                                              (1, 4),
                                              (1, 5),
                                              (2, 2),
                                              (2, 5);

INSERT INTO notifications (user_id, type, title, message, link) VALUES
                                                                    (4, 'registration_approved', 'Đăng ký được duyệt', 'Đăng ký tham gia sự kiện "Trồng cây xanh" đã được duyệt.', '/events/1'),
                                                                    (5, 'event_approved', 'Sự kiện được duyệt', 'Sự kiện "Trồng cây xanh" đã được duyệt.', '/events/1');
