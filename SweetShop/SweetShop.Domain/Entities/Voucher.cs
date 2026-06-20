namespace SweetShop.Domain.Entities;

public class Voucher
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // npr. "WELCOME10"
    public string? Description { get; set; }

    // Tip popusta: true = procenat, false = fiksni iznos u €
    public bool IsPercentage { get; set; }

    // Vrednost popusta (10 = 10% ako IsPercentage=true, ili 10€ ako false)
    public decimal DiscountValue { get; set; }

    // Datumi
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }

    // Ograničenja
    public decimal? MinOrderAmount { get; set; } // Min vrednost porudžbine
    public int? MaxUsageCount { get; set; } // Max ukupan broj korišćenja
    public int CurrentUsageCount { get; set; } = 0; // Trenutno koliko puta je iskorišćen

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}