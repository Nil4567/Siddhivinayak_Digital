@Entity
@Table(name = "completed_orders")
public class CompletedOrder {
    @Id
    @Column(name = "completed_id")
    private UUID completedId;

    private String orderToken;
    private String customerName;
    private String jobDescription;
    private BigDecimal totalAmount;
    private Instant completedAt;

    // Getters and setters
}
