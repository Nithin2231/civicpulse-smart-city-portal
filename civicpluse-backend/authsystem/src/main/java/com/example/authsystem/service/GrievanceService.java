package com.example.authsystem.service;

import com.example.authsystem.entity.Grievance;
import com.example.authsystem.entity.User;
import com.example.authsystem.repository.GrievanceRepository;
import com.example.authsystem.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;

    public GrievanceService(GrievanceRepository grievanceRepository,
                            UserRepository userRepository) {
        this.grievanceRepository = grievanceRepository;
        this.userRepository = userRepository;
    }

    // === 1. SUBMIT GRIEVANCE (With Safe Image Names) ===
    public Grievance submitGrievance(String username, String title, String description,
                                     String category, String location, MultipartFile image) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Clean the filename so it never breaks React URLs
        String originalName = image.getOriginalFilename();
        if (originalName == null) originalName = "image.jpg";
        String cleanFileName = originalName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        
        String fileName = System.currentTimeMillis() + "_" + cleanFileName;
        String filePath = uploadDir + fileName;

        image.transferTo(new File(filePath));

        Grievance grievance = new Grievance();
        grievance.setTitle(title);
        grievance.setDescription(description);
        grievance.setCategory(category);
        grievance.setLocation(location);
        grievance.setImagePath(fileName); 
        grievance.setUser(user);
        grievance.setStatus("PENDING");

        return grievanceRepository.save(grievance);
    }

    // === 2. ASSIGN TO DEPARTMENT (NEW METHOD) ===
    public Grievance assignGrievance(Long id, String department, String priority, String deadline) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
                
        grievance.setDepartment(department);
        grievance.setPriority(priority);
        grievance.setDeadline(deadline);
        
        // Automatically move status forward
        grievance.setStatus("FORWARDED"); 
        
        return grievanceRepository.save(grievance);
    }

    // === 3. OTHER STANDARD METHODS ===
    public List<Grievance> getComplaintsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return grievanceRepository.findByUser(user);
    }

    public void deleteGrievance(Long id) {
        grievanceRepository.deleteById(id);
    }

    public Grievance updateGrievance(Long id, String title, String description, String category, String location) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        grievance.setTitle(title);
        grievance.setDescription(description);
        grievance.setCategory(category);
        grievance.setLocation(location);
        return grievanceRepository.save(grievance);
    }

    // Add this new method inside GrievanceService.java
public Grievance cancelGrievance(Long id, String reason) {
    Grievance grievance = grievanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));
            
    grievance.setStatus("CANCELLED");
    grievance.setCancellationReason(reason);
    
    return grievanceRepository.save(grievance);
}
}