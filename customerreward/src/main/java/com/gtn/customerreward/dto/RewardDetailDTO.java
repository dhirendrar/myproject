package com.gtn.customerreward.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RewardDetailDTO {
    private Long customerId;
    private int totalPoints;

    /*public RewardDetailDTO(Long customerId, int totalPoints) {
        this.customerId = customerId;
        this.totalPoints = totalPoints;
    }*/
}
