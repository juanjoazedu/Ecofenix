package com.ecofenix.payments.repository;

import com.ecofenix.payments.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
