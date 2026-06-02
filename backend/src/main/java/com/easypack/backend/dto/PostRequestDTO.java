package com.easypack.backend.dto;

import lombok.*;

@Getter
@Setter
public class PostRequestDTO {
    private String title;
    private String content;
    private int rating;
    private String country;
}