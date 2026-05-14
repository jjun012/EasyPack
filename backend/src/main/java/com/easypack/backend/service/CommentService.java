package com.easypack.backend.service;

import com.easypack.backend.dto.CommentRequestDTO;
import com.easypack.backend.dto.CommentResponseDTO;
import com.easypack.backend.model.Comment;
import com.easypack.backend.model.Post;
import com.easypack.backend.model.User;
import com.easypack.backend.repository.CommentRepository;
import com.easypack.backend.repository.PostRepository;
import com.easypack.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public CommentResponseDTO addComment(Long postId, String userId, CommentRequestDTO dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUserId(userId);
        comment.setContent(dto.getContent());
        Comment saved = commentRepository.save(comment);
        return new CommentResponseDTO(
                saved.getId(), saved.getContent(),
                user.getNickname(), saved.getCreatedAt()
        );
    }

    public List<CommentResponseDTO> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        return commentRepository.findByPostOrderByCreatedAtAsc(post)
                .stream().map(c -> {
                    String nickname = userRepository.findByUserId(c.getUserId())
                            .map(User::getNickname).orElse("알 수 없음");
                    return new CommentResponseDTO(
                            c.getId(), c.getContent(), nickname, c.getCreatedAt()
                    );
                }).collect(Collectors.toList());
    }

    public void deleteComment(Long commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        commentRepository.delete(comment);
    }
}