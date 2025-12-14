public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByStatusIn(List<String> statuses);
    List<Order> findByStatus(String status);
}
