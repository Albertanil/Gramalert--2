package com.gramalertplus.service;

import com.gramalertplus.dto.GrievanceDto;
import com.gramalertplus.entity.Grievance;
import com.gramalertplus.entity.User;
import com.gramalertplus.repository.GrievanceRepository;
import com.gramalertplus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GrievanceService {

    @Autowired
    private GrievanceRepository grievanceRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private FileStorageService fileStorageService;

    public List<GrievanceDto> getAllGrievances() {
        List<Grievance> grievances = grievanceRepository.findAll();
        List<Long> userIds = grievances.stream().map(Grievance::getUserId).distinct().collect(Collectors.toList());
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, Function.identity()));
        return grievances.stream().map(grievance -> convertToDto(grievance, userMap)).collect(Collectors.toList());
    }

    public GrievanceDto createGrievance(GrievanceDto dto, MultipartFile file, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Grievance newGrievance = new Grievance();
        newGrievance.setTitle(dto.title());
        newGrievance.setDescription(dto.description());
        newGrievance.setCategory(dto.category());
        newGrievance.setLatitude(dto.latitude());
        newGrievance.setLongitude(dto.longitude());
        newGrievance.setStatus("Received");
        newGrievance.setPriority("Medium");
        newGrievance.setUserId(user.getId());
        newGrievance.setDeadline(calculateDeadline(dto.category()));
        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(file);
            newGrievance.setFileUrl(fileUrl);
        }
        Grievance savedGrievance = grievanceRepository.save(newGrievance);
        GrievanceDto createdDto = convertToDto(savedGrievance, Map.of(user.getId(), user));
        messagingTemplate.convertAndSend("/topic/grievances", createdDto);
        return createdDto;
    }

    public GrievanceDto updateStatus(Long id, String newStatus) {
        return grievanceRepository.findById(id).map(grievance -> {
            grievance.setStatus(newStatus);
            if ("Resolved".equals(newStatus)) {
                grievance.setResolvedAt(LocalDateTime.now());
            }
            Grievance updatedGrievance = grievanceRepository.save(grievance);
            User user = userRepository.findById(grievance.getUserId()).orElse(null);
            GrievanceDto dto = convertToDto(updatedGrievance, user != null ? Map.of(user.getId(), user) : Map.of());
            messagingTemplate.convertAndSend("/topic/grievances", dto);
            return dto;
        }).orElse(null);
    }
    
    public GrievanceDto updateMyGrievance(Long grievanceId, GrievanceDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new EntityNotFoundException("Grievance not found"));

        if (!grievance.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("User is not authorized to edit this grievance");
        }

        grievance.setTitle(dto.title());
        grievance.setDescription(dto.description());
        grievance.setCategory(dto.category());
        
        Grievance updatedGrievance = grievanceRepository.save(grievance);
        
        GrievanceDto updatedDto = convertToDto(updatedGrievance, Map.of(user.getId(), user));
        messagingTemplate.convertAndSend("/topic/grievances", updatedDto);
        
        return updatedDto;
    }
    
    public List<GrievanceDto> getGrievancesByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Map<Long, User> userMap = Map.of(user.getId(), user);
        
        return grievanceRepository.findGrievancesByUserId(user.getId()).stream()
                .map(grievance -> convertToDto(grievance, userMap))
                .collect(Collectors.toList());
    }
    
    private LocalDateTime calculateDeadline(String category) {
        LocalDateTime now = LocalDateTime.now();
        switch (category.toLowerCase()) {
            case "water": case "electricity": return now.plusDays(2);
            case "health": return now.plusDays(3);
            case "roads": case "sanitation": return now.plusDays(7);
            default: return now.plusDays(10);
        }
    }

    private GrievanceDto convertToDto(Grievance grievance, Map<Long, User> userMap) {
        User user = userMap.get(grievance.getUserId());
        String username = (user != null) ? user.getUsername() : "Unknown User";
        return new GrievanceDto(
                grievance.getId(), grievance.getTitle(), grievance.getDescription(),
                grievance.getStatus(), grievance.getPriority(), grievance.getCategory(),
                grievance.getCreatedAt() != null ? grievance.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null,
                username, grievance.getLatitude(), grievance.getLongitude(), grievance.getFileUrl(),
                grievance.isOverdue(), grievance.getReportCount(), grievance.getEscalationLevel()
        );
    }
}