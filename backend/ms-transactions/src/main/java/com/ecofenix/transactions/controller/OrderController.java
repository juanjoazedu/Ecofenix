package com.ecofenix.transactions.controller;

import com.ecofenix.transactions.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/transactions")
public class OrderController {

    @Autowired
    private OrderService orderService;
}
