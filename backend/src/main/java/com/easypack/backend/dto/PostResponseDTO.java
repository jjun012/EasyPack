package com.easypack.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class PostResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String authorNickname;
    private int rating;
    private int likeCount;
    private String country;
    private LocalDateTime createdAt;
}