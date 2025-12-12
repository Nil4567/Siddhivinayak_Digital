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

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order, Principal principal) {
        return ResponseEntity.ok(orderService.createOrder(order, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Principal principal) {
        orderService.updateStatus(id, status, "admin"); // replace with role check from Principal
        return ResponseEntity.ok("Status updated");
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignStaff(@PathVariable Long id, @RequestParam String staff) {
        orderService.assignStaff(id, staff);
        return ResponseEntity.ok("Staff assigned");
    }
}
