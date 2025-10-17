package com.gramalertplus.controller;

import com.gramalertplus.dto.GrievanceDto;
import com.gramalertplus.service.GrievanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/grievances")
public class GrievanceController {

    @Autowired
    private GrievanceService grievanceService;

    @GetMapping
    public ResponseEntity<List<GrievanceDto>> getAllGrievances() {
        return ResponseEntity.ok(grievanceService.getAllGrievances());
    }
    
    @GetMapping("/my-requests")
    public ResponseEntity<List<GrievanceDto>> getMyGrievances(Principal principal) {
        return ResponseEntity.ok(grievanceService.getGrievancesByUsername(principal.getName()));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<GrievanceDto> createGrievance(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        
        GrievanceDto grievanceDto = new GrievanceDto(null, title, description, null, null, category, null, null, latitude, longitude, null, false, 0, 0);
        return ResponseEntity.ok(grievanceService.createGrievance(grievanceDto, file, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrievanceDto> updateMyGrievance(@PathVariable Long id, @RequestBody GrievanceDto grievanceDto, Principal principal) {
        return ResponseEntity.ok(grievanceService.updateMyGrievance(id, grievanceDto, principal.getName()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GrievanceDto> updateGrievanceStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        String newStatus = updates.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        GrievanceDto updatedGrievance = grievanceService.updateStatus(id, newStatus);
        if (updatedGrievance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedGrievance);
    }
}