package com.siddhivinayakdigital.service;

import com.siddhivinayakdigital.entity.Order;
import com.siddhivinayakdigital.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // Auto-generate Order ID
    private String generateOrderId() {
        long count = orderRepository.count() + 1;
        return "ORD-" + String.format("%04d", count);
    }

    // Auto-generate Order Token
    private String generateOrderToken() {
        long count = orderRepository.count() + 1;
        return "TOK-" + String.format("%04d", count);
    }

    public Order createOrder(Order order, String createdBy) {
        order.setOrderId(generateOrderId());
        order.setOrderToken(generateOrderToken());
        order.setOrderDate(order.getOrderDate() != null ? order.getOrderDate() : LocalDate.now());
        order.setPendingAmount(order.getTotalAmount() - order.getAdvanceAmount());
        order.setCreatedBy(createdBy);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public void updateStatus(Long id, String status, String role) {
        Order order = orderRepository.findById(id).orElseThrow();
        if ("Completed".equals(status) && !"admin".equals(role)) {
            throw new RuntimeException("Only admin can mark orders as Completed");
        }
        order.setStatus(status);
        orderRepository.save(order);
    }

    public void assignStaff(Long id, String staffName) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setAssignedStaff(staffName);
        orderRepository.save(order);
    }
}
