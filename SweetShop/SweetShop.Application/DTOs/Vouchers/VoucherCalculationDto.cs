namespace SweetShop.Application.DTOs.Vouchers;

public class VoucherCalculationDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal OriginalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public bool IsValid { get; set; }
    public string? Message { get; set; }
}