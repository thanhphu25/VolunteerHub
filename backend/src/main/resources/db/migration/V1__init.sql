-- V1__init.sql
-- VolunteerHub schema (MySQL 8+) - for Flyway
SET @@SESSION.sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- disable fk checks while dropping/creating to avoid ordering issues
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ========== users ==========
CREATE TABLE users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       phone VARCHAR(50),
                       role ENUM('volunteer','organizer','admin') NOT NULL DEFAULT 'volunteer',
                       status ENUM('active','locked') NOT NULL DEFAULT 'active',
                       avatar_url VARCHAR(500),
                       bio TEXT,
                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                       deleted_at DATETIME(6) NULL,
                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                       last_login DATETIME(6) NULL,
                       INDEX idx_email (email),
                       INDEX idx_role (role),
                       INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== events ==========
CREATE TABLE events (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        organizer_id BIGINT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        slug VARCHAR(255) NULL,
                        description TEXT NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        location VARCHAR(500) NOT NULL,
                        address TEXT,
                        start_date DATETIME(6) NOT NULL,
                        end_date DATETIME(6) NOT NULL,
                        max_volunteers INT DEFAULT NULL,
                        current_volunteers INT DEFAULT 0,
                        status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
                        image_url VARCHAR(500),
                        requirements TEXT,
                        benefits TEXT,
                        contact_info VARCHAR(255),
                        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                        deleted_at DATETIME(6) NULL,
                        version BIGINT NOT NULL DEFAULT 0,
                        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                        approved_at DATETIME(6) NULL,
                        approved_by BIGINT NULL,
                        CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
                        CONSTRAINT fk_events_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                        CONSTRAINT chk_start_before_end CHECK (start_date < end_date),
                        CONSTRAINT chk_max_nonneg CHECK (max_volunteers IS NULL OR max_volunteers >= 0),
                        INDEX idx_organizer (organizer_id),
                        INDEX idx_status (status),
                        INDEX idx_category (category),
                        INDEX idx_start_date (start_date),
                        INDEX idx_created_at (created_at),
                        INDEX idx_status_start (status, start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== registrations ==========
CREATE TABLE registrations (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               event_id BIGINT NOT NULL,
                               volunteer_id BIGINT NOT NULL,
                               status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
                               note TEXT,
                               organizer_note TEXT,
                               attendance_status ENUM('absent','present') DEFAULT NULL,
                               completion_note TEXT,
                               registered_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               approved_at DATETIME(6) NULL,
                               completed_at DATETIME(6) NULL,
                               cancelled_at DATETIME(6) NULL,
                               CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                               CONSTRAINT fk_reg_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
                               UNIQUE KEY unique_registration (event_id, volunteer_id),
                               INDEX idx_event_status (event_id, status),
                               INDEX idx_volunteer (volunteer_id),
                               INDEX idx_status (status),
                               INDEX idx_registered_at (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== posts ==========
CREATE TABLE posts (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       event_id BIGINT NOT NULL,
                       user_id BIGINT NOT NULL,
                       content TEXT NOT NULL,
                       image_url VARCHAR(500),
                       likes_count INT DEFAULT 0,
                       comments_count INT DEFAULT 0,
                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                       deleted_at DATETIME(6) NULL,
                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                       CONSTRAINT fk_posts_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                       CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                       INDEX idx_post_event (event_id),
                       INDEX idx_post_user (user_id),
                       INDEX idx_post_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== post_comments ==========
CREATE TABLE post_comments (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               post_id BIGINT NOT NULL,
                               user_id BIGINT NOT NULL,
                               content TEXT NOT NULL,
                               is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                               deleted_at DATETIME(6) NULL,
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                               CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                               CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               INDEX idx_comment_post (post_id),
                               INDEX idx_comment_user (user_id),
                               INDEX idx_comment_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== post_likes ==========
CREATE TABLE post_likes (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            post_id BIGINT NOT NULL,
                            user_id BIGINT NOT NULL,
                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                            CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                            CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            UNIQUE KEY unique_like (post_id, user_id),
                            INDEX idx_like_post (post_id),
                            INDEX idx_like_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== notifications ==========
CREATE TABLE notifications (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               user_id BIGINT NOT NULL,
                               type VARCHAR(100) NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               payload JSON NULL,
                               link VARCHAR(500),
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               INDEX idx_notification_user (user_id),
                               INDEX idx_notification_read_created (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== push_subscriptions ==========
CREATE TABLE push_subscriptions (
                                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                    user_id BIGINT NOT NULL,
                                    endpoint TEXT NOT NULL,
                                    keys_json JSON NULL,
                                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                    CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                    INDEX idx_push_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== audit_logs ==========
CREATE TABLE audit_logs (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            user_id BIGINT NULL,
                            action VARCHAR(255) NOT NULL,
                            details JSON NULL,
                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                            CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                            INDEX idx_audit_user (user_id),
                            INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
