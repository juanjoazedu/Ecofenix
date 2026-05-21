package com.ecofenix.payments.service;

import com.ecofenix.payments.model.dto.InvoiceResponseDTO;
import com.ecofenix.payments.model.dto.PaymentRequestDTO;
import com.ecofenix.payments.model.dto.PaymentResponseDTO;

public interface PaymentService {

    PaymentResponseDTO createPayment(PaymentRequestDTO request);

    PaymentResponseDTO findPaymentById(Long id);

    InvoiceResponseDTO getInvoiceByPaymentId(Long paymentId);
}
