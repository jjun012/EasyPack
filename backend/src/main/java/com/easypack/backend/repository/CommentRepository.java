package com.easypack.backend.repository;

import com.easypack.backend.model.Comment;
import com.easypack.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
    int countByPost(Post post);
}