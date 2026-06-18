using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.DTOs.ShippingAddresses;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/shipping-addresses")]
[Authorize]
public class ShippingAddressesController : ControllerBase
{
    private readonly IShippingAddressService _shippingAddressService;

    public ShippingAddressesController(IShippingAddressService shippingAddressService)
    {
        _shippingAddressService = shippingAddressService;
    }

    /// <summary>
    /// Vraća sve adrese trenutno prijavljenog kupca
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ShippingAddressDetailsDto>>> GetMyAddresses()
    {
        var addresses = await _shippingAddressService.GetCurrentCustomerAddressesAsync();
        return Ok(addresses);
    }

    /// <summary>
    /// Vraća adresu po ID-u (samo svoju)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ShippingAddressDetailsDto>> GetById(int id)
    {
        var address = await _shippingAddressService.GetByIdAsync(id);
        return Ok(address);
    }

    /// <summary>
    /// Kreira novu adresu
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ShippingAddressDetailsDto>> Create([FromBody] CreateShippingAddressDto dto)
    {
        var address = await _shippingAddressService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = address.Id }, address);
    }

    /// <summary>
    /// Ažurira adresu
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ShippingAddressDetailsDto>> Update(int id, [FromBody] UpdateShippingAddressDto dto)
    {
        var address = await _shippingAddressService.UpdateAsync(id, dto);
        return Ok(address);
    }

    /// <summary>
    /// Briše adresu
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _shippingAddressService.DeleteAsync(id);
        return NoContent();
    }
}