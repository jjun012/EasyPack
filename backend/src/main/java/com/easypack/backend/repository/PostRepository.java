package com.easypack.backend.repository;

import com.easypack.backend.model.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByCountryOrderByCreatedAtDesc(String country);

    @Query("SELECT p FROM Post p ORDER BY p.likeCount DESC, p.createdAt DESC")
    List<Post> findTopPopularPosts(Pageable pageable);
}