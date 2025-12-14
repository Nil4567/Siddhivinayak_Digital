@Entity
@Table(name = "orders")
public class Order {
    @Id
    @Column(name = "order_id")
    private UUID orderId;

    private String orderCode;
    private String customerName;
    private String jobDescription;
    private BigDecimal totalAmount;
    private String status; // Pending, Hold, In Process, Completed
    private Instant createdAt;

    // Getters and setters
}
