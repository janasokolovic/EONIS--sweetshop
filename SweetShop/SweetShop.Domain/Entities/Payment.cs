using SweetShop.Domain.Enums;

namespace SweetShop.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }

    // Foreign key - jedno plaćanje pripada jednoj porudžbini
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
}