package com.gramalertplus.service;

import com.gramalertplus.dto.ProfileDto;
import com.gramalertplus.dto.RegistrationRequest;
import com.gramalertplus.dto.UpdateProfileRequest;
import com.gramalertplus.dto.UserDto;
import com.gramalertplus.entity.User;
import com.gramalertplus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(RegistrationRequest registrationRequest) throws Exception {
        if (userRepository.findByUsername(registrationRequest.getUsername()).isPresent()) {
            throw new Exception("Username already exists");
        }
        
        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setRole("VILLAGER");

        return userRepository.save(newUser);
    }
    
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public User createUser(UserDto userDto) throws Exception {
        if (userRepository.findByUsername(userDto.username()).isPresent()) {
            throw new Exception("Username already exists");
        }

        User newUser = new User();
        newUser.setUsername(userDto.username());
        newUser.setEmail(userDto.email());
        newUser.setPassword(passwordEncoder.encode("password")); 
        newUser.setRole(userDto.role());

        return userRepository.save(newUser);
    }
    
    public void deleteUser(Long id) {
        if (id == 1L) {
            throw new UnsupportedOperationException("Cannot delete the primary admin account.");
        }
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public ProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return new ProfileDto(user.getUsername(), user.getEmail());
    }

    public void updateUserProfile(String currentUsername, UpdateProfileRequest request) throws Exception {
        User userToUpdate = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (StringUtils.hasText(request.getUsername()) && !currentUsername.equals(request.getUsername())) {
            Optional<User> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent()) {
                throw new Exception("Username '" + request.getUsername() + "' is already taken.");
            }
            userToUpdate.setUsername(request.getUsername());
        }

        if (StringUtils.hasText(request.getPassword())) {
            if (!StringUtils.hasText(request.getOldPassword())) {
                throw new Exception("Current password is required to set a new one.");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), userToUpdate.getPassword())) {
                throw new Exception("Incorrect current password.");
            }
            userToUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(userToUpdate);
    }

    // highlight-start
    // --- New Method for Password Verification ---
    public boolean verifyPassword(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return passwordEncoder.matches(password, user.getPassword());
    }
    // highlight-end

    private UserDto convertToDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}