package com.gtn.customerreward.repository;

import com.gtn.customerreward.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // 1. Get by ??
}
