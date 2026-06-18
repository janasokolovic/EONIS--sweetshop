using SweetShop.Application.DTOs.ShippingAddresses;

namespace SweetShop.Application.Interfaces;

public interface IShippingAddressService
{
    Task<List<ShippingAddressDetailsDto>> GetCurrentCustomerAddressesAsync();
    Task<ShippingAddressDetailsDto> GetByIdAsync(int id);
    Task<ShippingAddressDetailsDto> CreateAsync(CreateShippingAddressDto dto);
    Task<ShippingAddressDetailsDto> UpdateAsync(int id, UpdateShippingAddressDto dto);
    Task DeleteAsync(int id);
}