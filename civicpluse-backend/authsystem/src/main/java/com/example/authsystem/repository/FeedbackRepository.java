package com.example.authsystem.repository;

import com.example.authsystem.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Custom query to calculate the average rating 
    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM Feedback f")
    Double getAverageRating();
}