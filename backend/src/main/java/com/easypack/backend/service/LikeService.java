package com.easypack.backend.service;

import com.easypack.backend.model.Like;
import com.easypack.backend.model.Post;
import com.easypack.backend.repository.LikeRepository;
import com.easypack.backend.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public boolean toggleLike(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        return likeRepository.findByPostAndUserId(post, userId).map(like -> {
            likeRepository.delete(like);
            post.setLikeCount(post.getLikeCount() - 1);
            postRepository.save(post);
            return false;
        }).orElseGet(() -> {
            Like newLike = new Like();
            newLike.setPost(post);
            newLike.setUserId(userId);
            likeRepository.save(newLike);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return true;
        });
    }

    public boolean hasLiked(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        return likeRepository.findByPostAndUserId(post, userId).isPresent();
    }
}