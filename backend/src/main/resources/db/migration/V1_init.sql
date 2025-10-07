-- V1__init.sql
CREATE TABLE roles (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       full_name VARCHAR(255),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role_id INT,
                       is_locked BOOLEAN DEFAULT FALSE,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE events (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(100),
                        location VARCHAR(255),
                        start_time DATETIME,
                        end_time DATETIME,
                        status VARCHAR(20) DEFAULT 'DRAFT',
                        created_by INT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE registrations (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               event_id INT,
                               user_id INT,
                               status VARCHAR(20) DEFAULT 'PENDING',
                               registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY (event_id) REFERENCES events(id),
                               FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
