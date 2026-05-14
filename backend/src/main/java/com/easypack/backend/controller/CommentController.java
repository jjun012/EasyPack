package com.easypack.backend.controller;

import com.easypack.backend.config.JwtUtil;
import com.easypack.backend.dto.CommentRequestDTO;
import com.easypack.backend.dto.CommentResponseDTO;
import com.easypack.backend.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommentController {

    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    public CommentController(CommentService commentService, JwtUtil jwtUtil) {
        this.commentService = commentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/post/{postId}/comment")
    public ResponseEntity<?> addComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long postId,
            @RequestBody CommentRequestDTO dto) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(commentService.addComment(postId, userId, dto));
    }

    @GetMapping("/post/{postId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<?> deleteComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long commentId) {
        String userId = jwtUtil.validateTokenAndGetUserId(token.replace("Bearer ", ""));
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok(Map.of("message", "댓글이 삭제되었습니다."));
    }
}