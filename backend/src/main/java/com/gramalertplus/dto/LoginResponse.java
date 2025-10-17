// dto/LoginResponse.java
package com.gramalertplus.dto;

// DTO for sending the authentication response.
public record LoginResponse(String token, String role, String username) {}