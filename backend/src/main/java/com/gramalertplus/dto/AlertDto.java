// In backend/src/main/java/com/gramalertplus/dto/AlertDto.java

package com.gramalertplus.dto;

import java.time.LocalDateTime;

public record AlertDto(
    Long id, 
    String title, 
    String description, 
    String category, 
    String severity,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String createdAt
) {}