using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.DTOs.Vouchers;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _voucherService;

    public VouchersController(IVoucherService voucherService)
    {
        _voucherService = voucherService;
    }

 
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var vouchers = await _voucherService.GetAllAsync();
        return Ok(vouchers);
    }


    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var voucher = await _voucherService.GetByIdAsync(id);
        return Ok(voucher);
    }

 
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVoucherDto dto)
    {
        var voucher = await _voucherService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = voucher.Id }, voucher);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVoucherDto dto)
    {
        var voucher = await _voucherService.UpdateAsync(id, dto);
        return Ok(voucher);
    }


    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _voucherService.DeleteAsync(id);
        return NoContent();
    }

   
    [HttpPost("apply")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Apply([FromBody] ApplyVoucherDto dto)
    {
        var result = await _voucherService.ApplyVoucherAsync(dto);
        return Ok(result);
    }
}