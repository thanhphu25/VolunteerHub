package com.volunteerhub.backend.config;

import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createIfNotExists("admin@vh.test", "Admin User", "admin", "Admin123!");
        createIfNotExists("org1@vh.test", "Organizer One", "organizer", "Org123456!");
        createIfNotExists("vol1@vh.test", "Volunteer One", "volunteer", "Vol123456!");
    }

    private void createIfNotExists(String email, String fullName, String roleName, String rawPassword) {
        if (userRepository.existsByEmail(email)) return;
        UserEntity u = new UserEntity();
        u.setEmail(email);
        u.setFullName(fullName);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setRole(Role.valueOf(roleName)); // roleName matches enum names: volunteer, organizer, admin
        userRepository.save(u);
        System.out.println("Created demo user: " + email + " / " + rawPassword + " role=" + roleName);
    }
}
