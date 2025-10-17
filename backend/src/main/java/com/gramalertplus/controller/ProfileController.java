package com.gramalertplus.controller;

import com.gramalertplus.dto.PasswordVerificationRequest;
import com.gramalertplus.dto.ProfileDto;
import com.gramalertplus.dto.UpdateProfileRequest;
import com.gramalertplus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getMyProfile(Principal principal) {
        return ResponseEntity.ok(userService.getUserProfile(principal.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody UpdateProfileRequest request, Principal principal) {
        try {
            userService.updateUserProfile(principal.getName(), request);
            return ResponseEntity.ok("Profile updated successfully. Please log in again.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/me/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody PasswordVerificationRequest request, Principal principal) {
        boolean isCorrect = userService.verifyPassword(principal.getName(), request.getPassword());
        if (isCorrect) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(401).body("Incorrect password.");
        }
    }
}