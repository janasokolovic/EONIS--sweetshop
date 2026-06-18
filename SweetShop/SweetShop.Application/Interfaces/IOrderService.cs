using SweetShop.Application.Common;
using SweetShop.Application.DTOs.Orders;

namespace SweetShop.Application.Interfaces;

public interface IOrderService
{
    // Customer
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
    Task<List<OrderDto>> GetCustomerOrdersAsync();
    Task<OrderDto> GetByIdAsync(int id);

    // Admin
    Task<PagedResult<OrderDto>> GetAllAsync(PaginationParams paginationParams);
    Task<OrderDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
}