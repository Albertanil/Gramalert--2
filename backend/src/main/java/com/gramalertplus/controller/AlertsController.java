// In backend/src/main/java/com/gramalertplus/controller/AlertsController.java
package com.gramalertplus.controller;

import com.gramalertplus.dto.AlertDto;
import com.gramalertplus.entity.User;
import com.gramalertplus.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/alerts")
public class AlertsController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertDto>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    // highlight-start
    @PostMapping
    public ResponseEntity<AlertDto> createAlert(@RequestBody AlertDto alertDto, Authentication authentication) {
        // This is a more reliable way to get the full User object from the security context
        User adminUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(alertService.createAlert(alertDto, adminUser.getId()));
    }
    // highlight-end

    @PutMapping("/{id}")
    public ResponseEntity<AlertDto> updateAlert(@PathVariable Long id, @RequestBody AlertDto alertDto) {
        AlertDto updatedAlert = alertService.updateAlert(id, alertDto);
        return ResponseEntity.ok(updatedAlert);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}