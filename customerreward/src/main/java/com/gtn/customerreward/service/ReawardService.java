package com.gtn.customerreward.service;


import com.gtn.customerreward.dto.MonthlyRewardDTO;

import java.util.List;


public interface ReawardService {

    /**
     * per month points
     *
     * @param customerId
     * @return
     */
    public List<MonthlyRewardDTO> getMonthlyRewards(Long customerId);


    /**
     * total points per cust
     *
     * @param customerId
     * @return
     */
    public int getTotalRewards(Long customerId);
}
