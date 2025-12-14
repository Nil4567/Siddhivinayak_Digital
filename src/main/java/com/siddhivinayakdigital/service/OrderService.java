@Service
public class OrderService {
    @Autowired private OrderRepository orderRepo;
    @Autowired private CompletedOrderRepository completedRepo;

    public List<Order> getNewOrders() {
        return orderRepo.findByStatusIn(List.of("Pending", "Hold"));
    }

    public List<Order> getQueueOrders() {
        return orderRepo.findByStatus("In Process");
    }

    public List<CompletedOrder> getCompletedOrders() {
        return completedRepo.findAll();
    }

    public void startOrder(UUID orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("In Process");
        orderRepo.save(order);
    }

    public void completeOrder(UUID orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("Completed");
        orderRepo.save(order); // Trigger will move it to completed_orders
    }

    public void createOrder(Order order) {
        order.setOrderId(UUID.randomUUID());
        order.setStatus("Pending");
        order.setCreatedAt(Instant.now());
        orderRepo.save(order);
    }
}
