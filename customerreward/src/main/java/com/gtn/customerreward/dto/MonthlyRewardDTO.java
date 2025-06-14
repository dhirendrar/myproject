package com.gtn.customerreward.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRewardDTO {
    private String month;
    private int points;

    /*public MonthlyRewardDTO(String month, int points) {
        this.month = month;
        this.points = points;
    }*/
}
