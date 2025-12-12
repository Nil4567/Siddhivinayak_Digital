package com.siddhivinayakdigital.repository;

import com.siddhivinayakdigital.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
}
