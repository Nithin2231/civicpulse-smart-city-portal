package com.example.authsystem.controller;

import com.example.authsystem.entity.Grievance;
import com.example.authsystem.repository.GrievanceRepository;
import com.example.authsystem.service.GrievanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

    // 7. Assign to Department (Admin Workflow)
    @PutMapping("/assign/{id}")
    public Grievance assignComplaint(
            @PathVariable Long id,
            @RequestParam String department,
            @RequestParam String priority,
            @RequestParam String deadline) {
        return grievanceService.assignGrievance(id, department, priority, deadline);
    }

    // 8. Cancel Complaint
    @PutMapping("/cancel/{id}")
    public Grievance cancelComplaint(
            @PathVariable Long id,
            @RequestParam String reason) {
        return grievanceService.cancelGrievance(id, reason);
    }

    // 9. GET: Fetch grievances assigned to a specific department (Officer)
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<Grievance>> getGrievancesByDepartment(@PathVariable String departmentName) {
        // Assuming you added findByDepartment to your GrievanceRepository!
        return ResponseEntity.ok(grievanceRepository.findByDepartment(departmentName)); 
    }

    // 10. PUT: Officer updates status, adds notes, and uploads resolved image
    @PutMapping("/resolve/{id}")
    public ResponseEntity<?> resolveGrievance(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "resolutionNotes", required = false) String resolutionNotes,
            @RequestParam(value = "resolvedImage", required = false) MultipartFile resolvedImage) {
        
        try {
            Grievance grievance = grievanceRepository.findById(id).orElse(null);
            if (grievance == null) {
                return ResponseEntity.badRequest().body("Grievance not found");
            }

            grievance.setStatus(status);
            if (resolutionNotes != null) {
                grievance.setResolutionNotes(resolutionNotes);
            }

            // ACTUAL FILE SAVING LOGIC
            if (resolvedImage != null && !resolvedImage.isEmpty()) {
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String fileName = System.currentTimeMillis() + "_" + resolvedImage.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(resolvedImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                grievance.setResolvedImagePath(fileName);
            }

            Grievance updatedGrievance = grievanceRepository.save(grievance);
            return ResponseEntity.ok(updatedGrievance);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating grievance");
        }
    }

    // === NEW: ANALYTICS & REPORTS (ADMIN & OFFICER) ===

    @GetMapping("/analytics/category")
    public ResponseEntity<List<java.util.Map<String, Object>>> getCategoryAnalytics() {
        List<java.util.Map<String, Object>> result = grievanceRepository.countByCategory().stream().map(obj -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("label", obj[0]);
            map.put("value", obj[1]);
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics/status")
    public ResponseEntity<List<java.util.Map<String, Object>>> getStatusAnalytics() {
        List<java.util.Map<String, Object>> result = grievanceRepository.countByStatus().stream().map(obj -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("label", obj[0]);
            map.put("value", obj[1]);
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics/zones")
    public ResponseEntity<List<java.util.Map<String, Object>>> getRedZones() {
        List<java.util.Map<String, Object>> result = grievanceRepository.countByLocation().stream().map(obj -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("location", obj[0]);
            map.put("count", obj[1]);
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // === NEW: OFFICER DEPARTMENT ANALYTICS ===
    @GetMapping("/analytics/department/{departmentName}")
    public ResponseEntity<List<java.util.Map<String, Object>>> getDepartmentAnalytics(@PathVariable String departmentName) {
        List<java.util.Map<String, Object>> result = grievanceRepository.countByStatusAndDepartment(departmentName).stream().map(obj -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("label", obj[0]);
            map.put("value", obj[1]);
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }
}