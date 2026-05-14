package com.easypack.backend.controller;

import com.easypack.backend.config.JwtUtil;
import com.easypack.backend.dto.PostListItemDTO;
import com.easypack.backend.dto.PostRequestDTO;
import com.easypack.backend.dto.PostResponseDTO;
import com.easypack.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class PostController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

    public PostController(PostService postService, JwtUtil jwtUtil) {
        this.postService = postService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/post")
    public ResponseEntity<?> createPost(
            @RequestHeader("Authorization") String token,
            @RequestBody PostRequestDTO dto) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(postService.createPost(userId, dto));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getPost(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @GetMapping("/posts/country/{country}")
    public ResponseEntity<List<PostListItemDTO>> getPostsByCountry(
            @PathVariable String country) {
        return ResponseEntity.ok(postService.getPostsByCountry(country));
    }

    @GetMapping("/posts/popular")
    public ResponseEntity<List<PostListItemDTO>> getPopularPosts() {
        return ResponseEntity.ok(postService.getPopularPosts(5));
    }

    @PutMapping("/post/{postId}")
    public ResponseEntity<?> updatePost(
            @RequestHeader("Authorization") String token,
            @PathVariable Long postId,
            @RequestBody PostRequestDTO dto) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(postService.updatePost(postId, userId, dto));
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<?> deletePost(
            @RequestHeader("Authorization") String token,
            @PathVariable Long postId) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        postService.deletePost(postId, userId);
        return ResponseEntity.ok(Map.of("message", "게시글이 삭제되었습니다."));
    }
}