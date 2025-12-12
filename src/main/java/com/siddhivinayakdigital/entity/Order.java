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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getOrderToken() { return orderToken; }
    public void setOrderToken(String orderToken) { this.orderToken = orderToken; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public String getCustName() { return custName; }
    public void setCustName(String custName) { this.custName = custName; }

    public String getCustEmail() { return custEmail; }
    public void setCustEmail(String custEmail) { this.custEmail = custEmail; }

    public String getCustMobile() { return custMobile; }
    public void setCustMobile(String custMobile) { this.custMobile = custMobile; }

    public String getJobDesc() { return jobDesc; }
    public void setJobDesc(String jobDesc) { this.jobDesc = jobDesc; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(Double advanceAmount) { this.advanceAmount = advanceAmount; }

    public Double getPendingAmount() { return pendingAmount; }
    public void setPendingAmount(Double pendingAmount) { this.pendingAmount = pendingAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(String assignedStaff) { this.assignedStaff = assignedStaff; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
