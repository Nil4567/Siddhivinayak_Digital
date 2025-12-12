package com.siddhivinayakdigital.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String displayName;

    @Column(nullable = false)
    private String role; // "admin" or "staff"

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
}
