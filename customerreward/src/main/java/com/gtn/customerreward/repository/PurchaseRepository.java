package com.gtn.customerreward.repository;


import com.gtn.customerreward.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    // Get by id
    List<Purchase> findByCustomerId(Long customerId);

    /*@Query("SELECT p.purchase_date,\n" +
            "       as            month,\n" +
            "       Sum(p.amount) AS totalAmount\n" +
            "FROM   purchase p\n" +
            "WHERE  p.customer.customerid = 1\n" +
            "GROUP  BY p.purchase_date\n" +
            "ORDER  BY month ")
    List<MonthlyPurchaseSummaryDTO> getMonthlyPurchasesByCustomer(@Param("customerId") Long customerId);*/
}