// In backend/src/main/java/com/gramalertplus/dto/UpdateProfileRequest.java
package com.gramalertplus.dto;

public class UpdateProfileRequest {
    private String username;
    private String password;
    // highlight-start
    private String oldPassword; // New field
    // highlight-end

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    // highlight-start
    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
    // highlight-end
}