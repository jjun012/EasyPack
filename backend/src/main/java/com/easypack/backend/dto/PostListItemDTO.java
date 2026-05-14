package com.easypack.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class PostListItemDTO {
    private Long id;
    private String title;
    private String contentSummary;
    private String authorNickname;
    private int rating;
    private int likeCount;
    private int commentCount;
    private String country;
    private LocalDateTime createdAt;
}