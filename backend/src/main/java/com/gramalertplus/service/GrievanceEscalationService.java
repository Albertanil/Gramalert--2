// In backend/src/main/java/com/gramalertplus/service/GrievanceEscalationService.java
package com.gramalertplus.service;

import com.gramalertplus.entity.Grievance;
import com.gramalertplus.repository.GrievanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GrievanceEscalationService {

    private static final Logger logger = LoggerFactory.getLogger(GrievanceEscalationService.class);

    @Autowired
    private GrievanceRepository grievanceRepository;

    // This method will run every hour (3600000 milliseconds)
    @Scheduled(fixedRate = 3600000)
    public void checkForOverdueGrievances() {
        logger.info("Running scheduled task to check for overdue grievances...");
        
        List<Grievance> activeGrievances = grievanceRepository.findAll()
            .stream()
            .filter(g -> !"Resolved".equals(g.getStatus()))
            .toList();

        for (Grievance grievance : activeGrievances) {
            if (grievance.getDeadline() != null && LocalDateTime.now().isAfter(grievance.getDeadline())) {
                if (!grievance.isOverdue()) {
                    logger.warn("Grievance ID {} is now overdue. Escalating.", grievance.getId());
                    grievance.setOverdue(true);
                    grievance.setPriority("High"); // Automatically set priority to High
                    grievance.setEscalationLevel(1); // Escalate to level 1
                    
                    // TODO: Add logic here to send an email notification to the next authority
                    
                    grievanceRepository.save(grievance);
                }
            }
        }
        logger.info("Finished checking for overdue grievances.");
    }
}