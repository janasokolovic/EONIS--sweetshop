using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.Common;
using SweetShop.Application.DTOs.Orders;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // ============= CUSTOMER ENDPOINTS =============

    /// <summary>
    /// Kreira porudžbinu iz korpe (Customer)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = await _orderService.CreateOrderAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    /// <summary>
    /// Vraća sve porudžbine trenutno prijavljenog kupca (Customer)
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var orders = await _orderService.GetCustomerOrdersAsync();
        return Ok(orders);
    }

    /// <summary>
    /// Vraća porudžbinu po ID-u (Customer može svoju, Admin sve)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        var order = await _orderService.GetByIdAsync(id);
        return Ok(order);
    }

    // ============= ADMIN ENDPOINTS =============

    /// <summary>
    /// Vraća sve porudžbine sa paginacijom (samo Admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetAll(
        [FromQuery] PaginationParams paginationParams)
    {
        var result = await _orderService.GetAllAsync(paginationParams);
        return Ok(result);
    }

    /// <summary>
    /// Ažurira status porudžbine (samo Admin)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _orderService.UpdateStatusAsync(id, dto);
        return Ok(order);
    }
}