package com.siddhivinayakdigital.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;

    private String changedBy; // user ID

    private String changeType; // e.g. "Status Update", "Staff Assignment"

    private String oldValue;
    private String newValue;

    private LocalDateTime changedAt = LocalDateTime.now();

    // Getters and Setters
}
