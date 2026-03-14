package com.example.authsystem.controller;

import com.example.authsystem.entity.Feedback;
import com.example.authsystem.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*") // Adjust to match your frontend port if needed (e.g., "http://localhost:3000")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // POST: Add new feedback
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody Feedback feedback) {
        try {
            Feedback savedFeedback = feedbackService.saveFeedback(feedback);
            return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // GET: View all feedback for Admin
    @GetMapping("/all")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    // GET: Calculate average rating for Admin
    @GetMapping("/average")
    public ResponseEntity<Map<String, Double>> getAverageRating() {
        Double avg = feedbackService.getAverageRating();
        double roundedAvg = Math.round(avg * 10.0) / 10.0; // Round to 1 decimal
        return ResponseEntity.ok(Map.of("averageRating", roundedAvg));
    }
}