package com.easypack.backend.dto;

import lombok.*;

@Getter
@Setter
public class UserUpdateRequestDTO {
    private String nickname;
    private String travelDestination;
    private String airline;
}