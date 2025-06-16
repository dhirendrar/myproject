package com.gtn.customerreward.repository;


import com.gtn.customerreward.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    // Get by Customer
    List<Purchase> findByCustomerId(Long customerId);
}