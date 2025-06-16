package com.gtn.customerreward.mapper;

import com.gtn.customerreward.dto.CustomerDetailDTO;
import com.gtn.customerreward.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    /**
     * to dto
     *
     * @param customer
     * @return
     */
    public CustomerDetailDTO toDTO(Customer customer) {
        if (customer == null) return null;
        return new CustomerDetailDTO(customer.getId(), customer.getName());
    }

    /**
     * to enty
     *
     * @param dto
     * @return
     */
    public Customer toEntity(CustomerDetailDTO dto) {
        if (dto == null) return null;
        Customer customer = new Customer();
        customer.setId(dto.getId());
        customer.setName(dto.getName());
        return customer;
    }
}
