package com.easypack.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private String content;
    private String authorNickname;
    private LocalDateTime createdAt;
}