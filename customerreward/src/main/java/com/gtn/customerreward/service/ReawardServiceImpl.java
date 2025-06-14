package com.gtn.customerreward.service;


import com.gtn.customerreward.dto.MonthlyRewardDTO;
import com.gtn.customerreward.entity.Purchase;
import com.gtn.customerreward.exception.ResourceNotFoundException;
import com.gtn.customerreward.repository.PurchaseRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ReawardServiceImpl implements ReawardService {

    //@Autowired
    private PurchaseRepository purchaseRepository;

    /**
     * calculate as per the logic provided
     *
     * @param amount
     * @return
     */
    public int calculateReward(double amount) {
        int points = 0;
        if (amount > 100) {
            // 2 pts if > 100 and  1 pt btwn 50–100
            points = points + (int) ((amount - 100) * 2) + 50;
        } else if (amount > 50) {
            points = points + (int) (amount - 50); // 1 pt if > 50
        }
        return points;
    }

    /*@Override
    public Map<String, Integer> getMonthlyRewards(Long customerId) {
        List<Purchase> purchases = purchaseRepository.findByCustomerId(customerId);
        Map<String, Integer> rewards = new HashMap<>();

        for (Purchase p : purchases) {
            String month = p.getPurchaseDate().getMonth().toString();
            int points = calculateReward(p.getAmount());
            rewards.merge(month, points, Integer::sum);
        }
        return rewards;
    }*/

    @Override
    public List<MonthlyRewardDTO> getMonthlyRewards(Long customerId) {
        List<Purchase> purchaseList = purchaseRepository.findByCustomerId(customerId);
        //Map<String, Integer> rewards = new HashMap<>();
        if (purchaseList != null && !purchaseList.isEmpty()) {
            List<MonthlyRewardDTO> rewardDTOS = new ArrayList<>();
            for (Purchase p : purchaseList) {
                rewardDTOS.add(new MonthlyRewardDTO(p.getPurchaseDate().getMonth().toString(), calculateReward(p.getAmount())));

                /*String month = p.getPurchaseDate().getMonth().toString();
                int points = calculateReward(p.getAmount());
                rewards.merge(month, points, Integer::sum);*/
            }
            return rewardDTOS;
        } else {
            throw new ResourceNotFoundException(" No Transaction Found.");
        }
    }

    @Override
    public int getTotalRewards(Long customerId) {
        List<Purchase> purchaseList = purchaseRepository.findByCustomerId(customerId);
        int points = 0;
        if (purchaseList != null && !purchaseList.isEmpty()) {
            for (Purchase purchase : purchaseList) {
                points = points + calculateReward(purchase.getAmount());
            }
        } else {
            throw new ResourceNotFoundException(" No Transaction Found.");
        }
        return points;
    }
}
