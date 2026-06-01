package com.easypack.backend.service;

import com.easypack.backend.dto.*;
import com.easypack.backend.model.Post;
import com.easypack.backend.model.User;
import com.easypack.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository,
                       LikeRepository likeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    public PostResponseDTO createPost(String userId, PostRequestDTO dto) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        Post post = new Post();
        post.setUserId(userId);
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setRating(dto.getRating());
        post.setAuthorNickname(user.getNickname());
        post.setCountry(dto.getCountry());
        post.setLikeCount(0);
        return toResponseDTO(postRepository.save(post));
    }

    public PostResponseDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        return toResponseDTO(post);
    }

    public PostResponseDTO updatePost(Long postId, String userId, PostRequestDTO dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setRating(dto.getRating());
        return toResponseDTO(postRepository.save(post));
    }

    public void deletePost(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        postRepository.delete(post);
    }

    public List<PostListItemDTO> getPopularPosts(int limit) {
        return postRepository.findTopPopularPosts(PageRequest.of(0, limit))
                .stream().map(this::toListItemDTO).collect(Collectors.toList());
    }

    public List<PostListItemDTO> getPostsByCountry(String country) {
        return postRepository.findByCountryOrderByCreatedAtDesc(country)
                .stream().map(this::toListItemDTO).collect(Collectors.toList());
    }

    private String summarize(String content) {
        return content.length() > 80 ? content.substring(0, 80) + "..." : content;
    }

    private PostResponseDTO toResponseDTO(Post post) {
        return new PostResponseDTO(
                post.getId(), post.getTitle(), post.getContent(),
                post.getAuthorNickname(), post.getRating(),
                likeRepository.countByPost(post),
                post.getCountry(), post.getCreatedAt()
        );
    }

    private PostListItemDTO toListItemDTO(Post post) {
        return new PostListItemDTO(
                post.getId(), post.getTitle(), summarize(post.getContent()),
                post.getAuthorNickname(), post.getRating(),
                likeRepository.countByPost(post),
                commentRepository.countByPost(post),
                post.getCountry(), post.getCreatedAt()
        );
    }
}