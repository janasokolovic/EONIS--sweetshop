using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.Common;
using SweetShop.Application.DTOs.Products;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Vraća listu proizvoda sa paginacijom, sortiranjem i pretragom
    /// </summary>
    /* [HttpGet]
     public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
         [FromQuery] PaginationParams paginationParams,
         [FromQuery] int? categoryId = null)
     {
         var result = await _productService.GetAllAsync(paginationParams, categoryId);
         return Ok(result);
     }*/
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams paginationParams, [FromQuery] int? categoryId = null, [FromQuery] bool includeInactive = false)
    {
        // Samo admin može da vidi neaktivne proizvode
        var isAdmin = User.IsInRole("Admin");
        var showInactive = isAdmin && includeInactive;

        var result = await _productService.GetAllAsync(paginationParams, categoryId, showInactive);
        return Ok(result);
    }

    /// <summary>
    /// Vraća proizvod po ID-u
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        return Ok(product);
    }

    /// <summary>
    /// Kreira novi proizvod (samo admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    /// <summary>
    /// Ažurira proizvod (samo admin)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var product = await _productService.UpdateAsync(id, dto);
        return Ok(product);
    }

    /// <summary>
    /// Briše proizvod (samo admin)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        await _productService.DeleteAsync(id);
        return NoContent();
    }
}