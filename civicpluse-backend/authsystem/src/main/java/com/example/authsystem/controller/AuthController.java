package com.example.authsystem.controller;

import org.springframework.web.bind.annotation.*;

import com.example.authsystem.entity.User;
import com.example.authsystem.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows your React app to talk to Spring Boot
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> request) {
        // FIXED: Now we extract "email" and "password" exactly as React sends them!
        String email = request.get("email");
        String password = request.get("password");
        
        // Passing the email into your authService (even if your service calls it 'username')
        return authService.login(email, password);
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody Map<String, String> request) {
        return authService.sendOtp(request.get("email"));
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> request) {
        return authService.resetPassword(
                request.get("email"),
                request.get("otp"),
                request.get("newPassword")
        );
    }
}