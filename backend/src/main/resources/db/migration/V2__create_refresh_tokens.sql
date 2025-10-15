-- V2__create_refresh_tokens.sql
-- Create refresh_tokens table to store issued refresh tokens (revocable)
-- Use token_hash (SHA-256 hex) for UNIQUE index to avoid long index on TEXT.

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                              token TEXT NULL,
                                              token_hash VARCHAR(64) NOT NULL,
                                              user_id BIGINT NOT NULL,
                                              revoked BOOLEAN NOT NULL DEFAULT FALSE,
                                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              expires_at DATETIME(6) NULL,
                                              CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                              UNIQUE KEY uq_refresh_token_hash (token_hash),
                                              INDEX idx_refresh_user (user_id),
                                              INDEX idx_refresh_revoked (revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
