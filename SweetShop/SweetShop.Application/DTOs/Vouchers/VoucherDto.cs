namespace SweetShop.Application.DTOs.Vouchers;

public class VoucherDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPercentage { get; set; }
    public decimal DiscountValue { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Computed property
    public bool IsExpired => DateTime.UtcNow > ValidUntil;
    public bool IsUsageLimitReached => MaxUsageCount.HasValue && CurrentUsageCount >= MaxUsageCount.Value;
}