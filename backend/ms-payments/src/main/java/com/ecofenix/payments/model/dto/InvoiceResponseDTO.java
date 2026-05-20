package com.ecofenix.payments.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponseDTO(
        Long id,
        String invoiceNumber,
        Long paymentId,
        Long customerId,
        LocalDateTime issueDate,
        Double subtotalItems,
        Double subtotalShipping,
        Double total,
        String address,
        String addInfo,
        List<InvoiceItemDTO> items
) {}