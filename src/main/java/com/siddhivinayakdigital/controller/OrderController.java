package com.siddhivinayakdigital.controller;

import com.siddhivinayakdigital.entity.Order;
import com.siddhivinayakdigital.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Create new order
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order, Principal principal) {
        return ResponseEntity.ok(orderService.createOrder(order, principal.getName()));
    }

    // Get all orders
    @GetMapping
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long id,
                                               @RequestParam String status,
                                               Principal principal) {
        // For now, hardcode role as "admin" until JWT/roles are wired in
        orderService.updateStatus(id, status, "admin");
        return ResponseEntity.ok("Status updated successfully");
    }

    // Assign staff to order
    @PutMapping("/{id}/assign")
    public ResponseEntity<String> assignStaff(@PathVariable Long id,
                                              @RequestParam String staff) {
        orderService.assignStaff(id, staff);
        return ResponseEntity.ok("Staff assigned successfully");
    }
}
