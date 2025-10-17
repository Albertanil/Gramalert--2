package com.gramalertplus.config;

import com.gramalertplus.entity.User;
import com.gramalertplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("No users found. Seeding database with demo users...");

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setEmail("admin@gramalert.com");
            admin.setRole("ADMIN"); // Use the simple name
            userRepository.save(admin);

            User villager = new User();
            villager.setUsername("villager");
            villager.setPassword(passwordEncoder.encode("password"));
            villager.setEmail("villager@gramalert.com");
            villager.setRole("VILLAGER"); // Use the simple name
            userRepository.save(villager);

            System.out.println("Demo users created successfully.");
        }
    }
}