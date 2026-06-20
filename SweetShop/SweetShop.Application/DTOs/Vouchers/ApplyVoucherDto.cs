namespace SweetShop.Application.DTOs.Vouchers;

public class ApplyVoucherDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderSubtotal { get; set; }
}