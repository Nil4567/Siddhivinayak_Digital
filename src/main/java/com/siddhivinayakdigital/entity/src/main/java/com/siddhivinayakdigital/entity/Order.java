package com.siddhivinayakdigital.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderId; // e.g. ORD-0001

    @Column(unique = true)
    private String orderToken; // customer-facing token

    @Column(nullable = false)
    private LocalDate orderDate;

    @Column(nullable = false)
    private String custName;

    private String custEmail; // optional

    @Column(nullable = false)
    private String custMobile;

    @Column(nullable = false)
    private String jobDesc;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private Double advanceAmount;

    @Column(nullable = false)
    private Double pendingAmount;

    @Column(nullable = false)
    private String status = "Pending"; // Pending, In Progress, Hold, Completed

    private String assignedStaff; // staff name or ID

    private String createdBy; // UID of creator

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
}
