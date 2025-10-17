// In backend/src/main/java/com/gramalertplus/dto/GrievanceDto.java
package com.gramalertplus.dto;

public record GrievanceDto(
    Long id,
    String title,
    String description,
    String status,
    String priority,
    String category,
    String createdAt,
    String submittedBy,
    Double latitude,
    Double longitude,
    String fileUrl,
    boolean isOverdue,
    int reportCount,
    int escalationLevel
) {}