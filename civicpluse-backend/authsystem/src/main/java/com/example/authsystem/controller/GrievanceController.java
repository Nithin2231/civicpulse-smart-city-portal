package com.example.authsystem.controller;

import com.example.authsystem.entity.Grievance;
import com.example.authsystem.repository.GrievanceRepository;
import com.example.authsystem.service.GrievanceService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "*") // Allows your React app (port 5173) to communicate with Spring Boot
public class GrievanceController {

    private final GrievanceService grievanceService;
    private final GrievanceRepository grievanceRepository;

    public GrievanceController(GrievanceService grievanceService,
                               GrievanceRepository grievanceRepository) {
        this.grievanceService = grievanceService;
        this.grievanceRepository = grievanceRepository;
    }

    // 1. Submit Complaint (Citizen)
    @PostMapping("/submit")
    public Grievance submit(
            @RequestParam String username,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String location,
            @RequestParam MultipartFile image
    ) throws IOException {
        return grievanceService.submitGrievance(username, title, description, category, location, image);
    }

    // 2. Get My Complaints (Citizen)
    @GetMapping("/my")
    public List<Grievance> getMyComplaints(@RequestParam String username) {
        return grievanceService.getComplaintsByUser(username);
    }

    // 3. Get All Complaints (Admin)
    @GetMapping("/all")
    public List<Grievance> getAllComplaints() {
        return grievanceRepository.findAll();
    }

    // 4. Delete Complaint
    @DeleteMapping("/delete/{id}")
    public String deleteComplaint(@PathVariable Long id) {
        grievanceService.deleteGrievance(id);
        return "Deleted Successfully";
    }

    // 5. Update Complaint Details
    @PutMapping("/update/{id}")
    public Grievance updateComplaint(@PathVariable Long id,
                                     @RequestParam String title,
                                     @RequestParam String description,
                                     @RequestParam String category,
                                     @RequestParam String location) {
        return grievanceService.updateGrievance(id, title, description, category, location);
    }

    // 6. Update Just the Status (Admin)
    @PutMapping("/update-status/{id}")
    public Grievance updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        grievance.setStatus(status);
        return grievanceRepository.save(grievance);
    }

    // === NEW: 7. Assign to Department (Admin Workflow) ===
    @PutMapping("/assign/{id}")
    public Grievance assignComplaint(
            @PathVariable Long id,
            @RequestParam String department,
            @RequestParam String priority,
            @RequestParam String deadline) {
        
        // Calls the new method we added to GrievanceService!
        return grievanceService.assignGrievance(id, department, priority, deadline);
    }

    // Add this new endpoint inside GrievanceController.java
@PutMapping("/cancel/{id}")
public Grievance cancelComplaint(
        @PathVariable Long id,
        @RequestParam String reason) {
    return grievanceService.cancelGrievance(id, reason);
}
}