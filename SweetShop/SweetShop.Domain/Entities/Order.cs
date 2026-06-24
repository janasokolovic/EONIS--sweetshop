using SweetShop.Domain.Enums;

namespace SweetShop.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }

    
    public string? VoucherCode { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal SubtotalAmount { get; set; } = 0; 

   
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

 
    public int ShippingAddressId { get; set; }
    public ShippingAddress ShippingAddress { get; set; } = null!;

 
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

  
    public Payment? Payment { get; set; }
}