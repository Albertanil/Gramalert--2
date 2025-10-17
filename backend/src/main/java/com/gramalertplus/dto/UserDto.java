// In backend/src/main/java/com/gramalertplus/dto/UserDto.java
package com.gramalertplus.dto;

public record UserDto(
    Long id,
    String username,
    String email,
    String role
) {}