using SweetShop.Domain.Enums;

namespace SweetShop.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }

    // Foreign key ka kupcu
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    // Foreign key ka adresi
    public int ShippingAddressId { get; set; }
    public ShippingAddress ShippingAddress { get; set; } = null!;

    // Navigacija - jedna porudžbina ima više stavki
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    // 1:1 sa Payment - jedna porudžbina ima jedno plaćanje
    public Payment? Payment { get; set; }
}