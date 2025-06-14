package com.gtn.customerreward.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailDTO {

    private Long id;
    private String name;

    /*public CustomerDetailDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }*/
}