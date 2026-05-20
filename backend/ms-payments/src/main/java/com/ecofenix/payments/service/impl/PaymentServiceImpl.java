package com.ecofenix.payments.service.impl;

import com.ecofenix.payments.client.TransactionFeignClient;
import com.ecofenix.payments.model.dto.*;
import com.ecofenix.payments.model.entity.Invoice;
import com.ecofenix.payments.model.entity.InvoiceItem;
import com.ecofenix.payments.model.entity.Payment;
import com.ecofenix.payments.model.enums.PaymentStatus;
import com.ecofenix.payments.model.enums.ShippingState;
import com.ecofenix.payments.repository.InvoiceRepository;
import com.ecofenix.payments.repository.PaymentRepository;
import com.ecofenix.payments.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private TransactionFeignClient transactionFeignClient;

    // Conversion methods
    private Payment convertToEntity(PaymentRequestDTO dto) {
        Payment payment = new Payment();
        payment.setTotal(dto.total());
        payment.setPaymentMethod(dto.paymentMethod());
        payment.setInstallments(dto.installments());
        payment.setOrderId(dto.orderId());
        payment.setCreatedAt(LocalDateTime.now());
        return payment;
    }

    private PaymentResponseDTO convertToDTO(Payment payment) {
        return new PaymentResponseDTO(
                payment.getId(),
                payment.getTotal(),
                payment.getPaymentMethod(),
                payment.getInstallments(),
                payment.getOrderId(),
                payment.getCreatedAt()
        );
    }

    private InvoiceResponseDTO convertInvoiceToDTO(Invoice invoice) {
        List<InvoiceItemDTO> itemDTOs = invoice.getItems().stream()
                .map(item -> new InvoiceItemDTO(
                        item.getId(),
                        item.getItemId(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getShippingCost(),
                        item.getTotalPrice()
                ))
                .toList();
        return new InvoiceResponseDTO(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getPayment().getId(),
                invoice.getCustomerId(),
                invoice.getIssueDate(),
                invoice.getSubtotalItems(),
                invoice.getSubtotalShipping(),
                invoice.getTotal(),
                invoice.getAddress(),
                invoice.getAddInfo(),
                itemDTOs
        );
    }

    //Supporting methods
    private Invoice createInvoiceFromOrder(Payment payment, OrderResponseDTO order) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setPayment(payment);
        invoice.setCustomerId(order.customerId());
        invoice.setIssueDate(LocalDateTime.now());
        invoice.setSubtotalItems(order.subtotalItems());
        invoice.setSubtotalShipping(order.subtotalShipping());
        invoice.setTotal(order.total());
        invoice.setAddress(order.address());
        invoice.setAddInfo(order.addInfo());

        List<InvoiceItem> items = new ArrayList<>();
        for (OrderItemResponseDTO orderItem : order.items()) {
            InvoiceItem item = new InvoiceItem();
            item.setItemId(orderItem.itemId());
            item.setQuantity(orderItem.quantity());
            item.setUnitPrice(orderItem.unitPrice());
            item.setShippingCost(orderItem.shippingCost());
            item.setTotalPrice(orderItem.totalPrice());
            item.setInvoice(invoice);
            items.add(item);
        }
        invoice.setItems(items);
        return invoice;
    }

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void validatePaymentRequest(PaymentRequestDTO request) {
        if (request.orderId() == null || request.orderId() <= 0) {
            throw new RuntimeException("Order ID inválido");
        }
        if (request.total() == null || request.total() <= 0) {
            throw new RuntimeException("El total debe ser mayor a 0");
        }
        if (request.paymentMethod() == null) {
            throw new RuntimeException("Debe seleccionar un método de pago");
        }
        if (request.installments() == null || request.installments() <= 0) {
            throw new RuntimeException("El número de cuotas debe ser mayor a 0");
        }
    }

    // CRUD methods
    @Override
    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        validatePaymentRequest(request);

        OrderResponseDTO order = transactionFeignClient.getOrderById(request.orderId());

        if (order.paymentStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("La orden no está en estado pendiente de pago. Estado actual: " + order.paymentStatus());
        }

        Payment payment = convertToEntity(request);
        Payment savedPayment = paymentRepository.save(payment);

        Invoice invoice = createInvoiceFromOrder(savedPayment, order);
        invoiceRepository.save(invoice);
        savedPayment.setInvoice(invoice);
        paymentRepository.save(savedPayment);

        UpdateOrderStatusRequestDTO statusUpdate = new UpdateOrderStatusRequestDTO(
                PaymentStatus.COMPLETED,
                ShippingState.PROCESSING
        );
        transactionFeignClient.updateOrderStatus(request.orderId(), statusUpdate);

        return convertToDTO(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO findPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        return convertToDTO(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceByPaymentId(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + paymentId));

        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada para el pago id: " + paymentId));

        return convertInvoiceToDTO(invoice);
    }
}