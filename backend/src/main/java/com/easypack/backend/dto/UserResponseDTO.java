package com.easypack.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class UserResponseDTO {
    private String userId;
    private String nickname;
    private String travelDestination;
    private String airline;
}