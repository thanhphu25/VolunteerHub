-- V3__add_email_verified_and_tokens.sql
-- Add email_verified to users and create verification_tokens table
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN email_verified_at DATETIME(6) NULL;

CREATE TABLE IF NOT EXISTS verification_tokens (
                                                   id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                   user_id BIGINT NOT NULL,
                                                   token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('verify_email','password_reset') NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_verif_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_verif_user_type (user_id, type),
    INDEX idx_verif_token (token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
