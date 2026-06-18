using SweetShop.Domain.Enums;

namespace SweetShop.Application.DTOs.Orders;

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}