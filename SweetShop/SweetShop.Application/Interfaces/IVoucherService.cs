using SweetShop.Application.DTOs.Vouchers;

namespace SweetShop.Application.Interfaces;

public interface IVoucherService
{
    // Admin
    Task<List<VoucherDto>> GetAllAsync();
    Task<VoucherDto> GetByIdAsync(int id);
    Task<VoucherDto> CreateAsync(CreateVoucherDto dto);
    Task<VoucherDto> UpdateAsync(int id, UpdateVoucherDto dto);
    Task DeleteAsync(int id);

    // Customer - validacija pri unosu koda u checkout
    Task<VoucherCalculationDto> ApplyVoucherAsync(ApplyVoucherDto dto);

    // Interno - poziva se iz OrderService kad se kreira porudžbina
    Task IncrementUsageCountAsync(string code);
}