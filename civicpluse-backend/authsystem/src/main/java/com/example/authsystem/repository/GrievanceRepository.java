package com.example.authsystem.repository;

import com.example.authsystem.entity.Grievance;
import com.example.authsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    
    // Spring Boot will automatically find grievances attached to a specific User
    List<Grievance> findByUser(User user);

    // Add this line inside your GrievanceRepository interface
    List<Grievance> findByDepartment(String department);

    @Query("SELECT g.category, COUNT(g) FROM Grievance g GROUP BY g.category")
    List<Object[]> countByCategory();

    @Query("SELECT g.status, COUNT(g) FROM Grievance g GROUP BY g.status")
    List<Object[]> countByStatus();

    // Gets locations ordered by most complaints (Red Zones)
    @Query("SELECT g.location, COUNT(g) FROM Grievance g GROUP BY g.location ORDER BY COUNT(g) DESC")
    List<Object[]> countByLocation();

    // === NEW: DEPARTMENT-SPECIFIC ANALYTICS ===
    @Query("SELECT g.status, COUNT(g) FROM Grievance g WHERE g.department = :department GROUP BY g.status")
    List<Object[]> countByStatusAndDepartment(@org.springframework.data.repository.query.Param("department") String department);
    
}