package com.gtn.customerreward.controller;

import com.gtn.customerreward.entity.Purchase;
import com.gtn.customerreward.entity.Customer;
import com.gtn.customerreward.repository.CustomerRepository;
import com.gtn.customerreward.repository.PurchaseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // create PO
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Purchase> createPurchase(
            @PathVariable Long customerId,
            @RequestBody Purchase purchaseRequest) {

        return customerRepository.findById(customerId)
                .map(customer -> {
                    purchaseRequest.setCustomer(customer);
                    Purchase savedPurchase = purchaseRepository.save(purchaseRequest);
                    return ResponseEntity.ok(savedPurchase);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // get all POs for a cust
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Purchase>> getPurchasesByCustomerId(@PathVariable Long customerId) {
        List<Purchase> purchases = purchaseRepository.findByCustomerId(customerId);
        return ResponseEntity.ok(purchases);
    }

    // dump all
    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseRepository.findAll());
    }
}
