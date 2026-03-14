package com.example.authsystem.repository;

import com.example.authsystem.entity.Grievance;
import com.example.authsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    
    // Spring Boot will automatically find grievances attached to a specific User
    List<Grievance> findByUser(User user);
    
}