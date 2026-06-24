using SweetShop.Application.DTOs.Auth;

namespace SweetShop.Application.Interfaces;

public interface ICustomerService
{
    Task<List<CustomerDto>> GetAllAsync(string? search = null);
    Task DeleteAsync(int id);
}
