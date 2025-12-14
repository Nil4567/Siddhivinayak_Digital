@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired private OrderService orderService;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("newOrders", orderService.getNewOrders());
        model.addAttribute("queueOrders", orderService.getQueueOrders());
        model.addAttribute("completedOrders", orderService.getCompletedOrders());
        return "admin-dashboard";
    }

    @PostMapping("/start/{id}")
    public String startOrder(@PathVariable UUID id) {
        orderService.startOrder(id);
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/complete/{id}")
    public String completeOrder(@PathVariable UUID id) {
        orderService.completeOrder(id);
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/orders/new")
    public String newOrderForm(Model model) {
        model.addAttribute("order", new Order());
        return "order-form";
    }

    @PostMapping("/orders/new")
    public String createOrder(@ModelAttribute Order order) {
        orderService.createOrder(order);
        return "redirect:/admin/dashboard";
    }
}
