using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.DTOs.Cart;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Sve operacije sa korpom zahtevaju prijavu
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    /// <summary>
    /// Vraća trenutnu korpu prijavljenog kupca
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCurrentCart()
    {
        var cart = await _cartService.GetCurrentCartAsync();
        return Ok(cart);
    }

    /// <summary>
    /// Dodaje proizvod u korpu
    /// </summary>
    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddToCartDto dto)
    {
        var cart = await _cartService.AddItemAsync(dto);
        return Ok(cart);
    }

    /// <summary>
    /// Ažurira količinu stavke u korpi
    /// </summary>
    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<CartDto>> UpdateItem(int itemId, [FromBody] UpdateCartItemDto dto)
    {
        var cart = await _cartService.UpdateItemAsync(itemId, dto);
        return Ok(cart);
    }

    /// <summary>
    /// Uklanja stavku iz korpe
    /// </summary>
    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult<CartDto>> RemoveItem(int itemId)
    {
        var cart = await _cartService.RemoveItemAsync(itemId);
        return Ok(cart);
    }

    /// <summary>
    /// Prazni korpu
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync();
        return NoContent();
    }
}