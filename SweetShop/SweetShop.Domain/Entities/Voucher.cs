namespace SweetShop.Domain.Entities;

public class Voucher
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; 
    public string? Description { get; set; }

 
    public bool IsPercentage { get; set; }

  
    public decimal DiscountValue { get; set; }


    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }

 
    public decimal? MinOrderAmount { get; set; } // Min vrednost porudžbine
    public int? MaxUsageCount { get; set; } // Max ukupan broj korišćenja
    public int CurrentUsageCount { get; set; } = 0; // Trenutno koliko puta je iskorišćen

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}