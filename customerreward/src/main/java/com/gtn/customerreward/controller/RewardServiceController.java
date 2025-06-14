package com.gtn.customerreward.controller;


import com.gtn.customerreward.dto.MonthlyRewardDTO;
import com.gtn.customerreward.dto.RewardDetailDTO;
import com.gtn.customerreward.repository.PurchaseRepository;
import com.gtn.customerreward.service.ReawardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardServiceController {

    @Autowired
    private ReawardService rewardService;

    @Autowired
    private PurchaseRepository purchaseRepo;

    /**
     * make PO - NR
     * @param customerId
     * @return
     */
    /*@PostMapping("/purchase")
    public ResponseEntity<String> addPurchase(@RequestBody Purchase purchase) {
        purchase.setPurchaseDate(LocalDate.now());
        purchaseRepo.save(purchase);
        return ResponseEntity.ok("Purchase Made.");
    }*/

    /**
     * @param customerId
     * @return
     */
    @GetMapping("/{customerId}/total")
    public ResponseEntity<RewardDetailDTO> getTotalRewards(@PathVariable Long customerId) {
        int points = rewardService.getTotalRewards(customerId);
        return ResponseEntity.ok(new RewardDetailDTO(customerId, points));
    }

    /**
     * Monthly points //anytime frame?
     *
     * @param customerId
     * @return
     */
    @GetMapping("/{customerId}/monthly")
    public ResponseEntity<List<MonthlyRewardDTO>> getMonthlyRewards(@PathVariable Long customerId) {
        List<MonthlyRewardDTO> rewardDTOS = rewardService.getMonthlyRewards(customerId);
        if (rewardDTOS.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(rewardDTOS);
    }
}