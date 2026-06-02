package com.easypack.backend.controller;

import com.easypack.backend.config.JwtUtil;
import com.easypack.backend.dto.UserResponseDTO;
import com.easypack.backend.dto.UserUpdateRequestDTO;
import com.easypack.backend.model.User;
import com.easypack.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            User user = userService.register(
                    request.get("user_id"),
                    request.get("password"),
                    request.get("nickname"),
                    request.get("travel_destination"),
                    request.get("airline")
            );
            return ResponseEntity.ok(new UserResponseDTO(
                    user.getUserId(), user.getNickname(),
                    user.getTravelDestination(), user.getAirline()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            User user = userService.authenticate(
                    request.get("user_id"), request.get("password"));
            String token = jwtUtil.generateToken(user.getUserId());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", new UserResponseDTO(
                            user.getUserId(), user.getNickname(),
                            user.getTravelDestination(), user.getAirline()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getMyInfo(@RequestHeader("Authorization") String token) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        User user = userService.findByUserId(userId);
        return ResponseEntity.ok(new UserResponseDTO(
                user.getUserId(), user.getNickname(),
                user.getTravelDestination(), user.getAirline()
        ));
    }

    @PutMapping("/user/update")
    public ResponseEntity<?> updateUserInfo(
            @RequestHeader("Authorization") String token,
            @RequestBody UserUpdateRequestDTO request) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        userService.updateUserInfo(userId, request);
        User user = userService.findByUserId(userId);
        return ResponseEntity.ok(new UserResponseDTO(
                user.getUserId(), user.getNickname(),
                user.getTravelDestination(), user.getAirline()
        ));
    }
}