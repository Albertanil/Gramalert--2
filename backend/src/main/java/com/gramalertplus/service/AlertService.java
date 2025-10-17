// In backend/src/main/java/com/gramalertplus/service/AlertService.java
package com.gramalertplus.service;

import com.gramalertplus.dto.AlertDto;
import com.gramalertplus.entity.Alert;
import com.gramalertplus.repository.AlertRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<AlertDto> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AlertDto createAlert(AlertDto dto, Long adminUserId) {
        Alert newAlert = new Alert();
        newAlert.setTitle(dto.title());
        newAlert.setDescription(dto.description());
        newAlert.setCategory(dto.category());
        newAlert.setSeverity(dto.severity());
        newAlert.setStartTime(dto.startTime());
        newAlert.setEndTime(dto.endTime());
        newAlert.setCreatedBy(adminUserId);

        Alert savedAlert = alertRepository.save(newAlert);
        AlertDto createdDto = convertToDto(savedAlert);

        messagingTemplate.convertAndSend("/topic/alerts", createdDto);
        return createdDto;
    }

    // highlight-start
    public AlertDto updateAlert(Long id, AlertDto dto) {
        Alert alertToUpdate = alertRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alert not found with id: " + id));

        alertToUpdate.setTitle(dto.title());
        alertToUpdate.setDescription(dto.description());
        alertToUpdate.setCategory(dto.category());
        alertToUpdate.setSeverity(dto.severity());
        alertToUpdate.setStartTime(dto.startTime());
        alertToUpdate.setEndTime(dto.endTime());

        Alert updatedAlert = alertRepository.save(alertToUpdate);
        AlertDto updatedDto = convertToDto(updatedAlert);
        
        // Also broadcast the update
        messagingTemplate.convertAndSend("/topic/alerts", updatedDto);
        
        return updatedDto;
    }

    public void deleteAlert(Long id) {
        if (!alertRepository.existsById(id)) {
            throw new EntityNotFoundException("Alert not found with id: " + id);
        }
        alertRepository.deleteById(id);

        // Broadcast a simple delete message
        messagingTemplate.convertAndSend("/topic/alerts/deleted", id);
    }
    // highlight-end
    
    private AlertDto convertToDto(Alert alert) {
        return new AlertDto(
            alert.getId(),
            alert.getTitle(),
            alert.getDescription(),
            alert.getCategory(),
            alert.getSeverity(),
            alert.getStartTime(),
            alert.getEndTime(),
            alert.getCreatedAt() != null ? alert.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null
        );
    }
}