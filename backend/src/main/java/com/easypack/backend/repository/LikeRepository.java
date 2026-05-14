package com.easypack.backend.repository;

import com.easypack.backend.model.Like;
import com.easypack.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByPostAndUserId(Post post, String userId);
    int countByPost(Post post);
}