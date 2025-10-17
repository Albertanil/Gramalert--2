// In backend/src/main/java/com/gramalertplus/dto/RegistrationRequest.java
package com.gramalertplus.dto;

public class RegistrationRequest {
    private String username;
    private String email;
    private String password;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}