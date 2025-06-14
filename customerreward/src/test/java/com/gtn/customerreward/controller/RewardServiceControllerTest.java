package com.gtn.customerreward.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gtn.customerreward.dto.MonthlyRewardDTO;
import com.gtn.customerreward.repository.PurchaseRepository;
import com.gtn.customerreward.service.ReawardService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RewardServiceController.class)
//@RunWith(SpringRunner.class)
class RewardServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReawardService rewardService;

    @MockBean
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    //@Test
    /*public void testAddPurchase() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setCustomerId(1L);
        purchase.setAmount(150.0);

        mockMvc.perform(post("/api/rewards/purchase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchase)))
                .andExpect(status().isOk())
                .andExpect(content().string("Purchase Made."));

        Mockito.verify(purchaseRepository).save(Mockito.any(Purchase.class));
    }*/

    @Test
    public void testGetTotalRewards() throws Exception {
        Long customerId = 1L;
        Mockito.when(rewardService.getTotalRewards(customerId)).thenReturn(10);

        mockMvc.perform(get("/api/rewards/{customerId}/total", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customerId))
                .andExpect(jsonPath("$.totalPoints").value(10));
    }


    @Test
    public void testGetMonthlyRewards_whenNoData() throws Exception {
        Long customerId = 2L;
        Mockito.when(rewardService.getMonthlyRewards(customerId)).thenReturn(List.of());

        mockMvc.perform(get("/api/rewards/{customerId}/monthly", customerId))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testGetMonthlyRewards_whenDataExists() throws Exception {
        Long customerId = 1L;
        List<MonthlyRewardDTO> mockList = List.of(
                new MonthlyRewardDTO("2025-05", 10),
                new MonthlyRewardDTO("2025-06", 20)
        );

        Mockito.when(rewardService.getMonthlyRewards(customerId)).thenReturn(mockList);

        mockMvc.perform(get("/api/rewards/{customerId}/monthly", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].month").value("2025-05"))
                .andExpect(jsonPath("$[0].points").value(10));
    }
}
