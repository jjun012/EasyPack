package com.easypack.backend.controller;

import com.easypack.backend.config.JwtUtil;
import com.easypack.backend.dto.LikeResponseDTO;
import com.easypack.backend.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community/post")
public class LikeController {

    private final LikeService likeService;
    private final JwtUtil jwtUtil;

    public LikeController(LikeService likeService, JwtUtil jwtUtil) {
        this.likeService = likeService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponseDTO> toggleLike(
            @RequestHeader("Authorization") String token,
            @PathVariable Long postId) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(new LikeResponseDTO(likeService.toggleLike(postId, userId)));
    }

    @GetMapping("/{postId}/like")
    public ResponseEntity<LikeResponseDTO> hasLiked(
            @RequestHeader("Authorization") String token,
            @PathVariable Long postId) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(new LikeResponseDTO(likeService.hasLiked(postId, userId)));
    }
}