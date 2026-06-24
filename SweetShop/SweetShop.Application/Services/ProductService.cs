using Microsoft.EntityFrameworkCore;
using SweetShop.Application.Common;
using SweetShop.Application.DTOs.Products;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Exceptions;

namespace SweetShop.Application.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<PagedResult<ProductDto>> GetAllAsync(PaginationParams paginationParams, int? categoryId = null, bool includeInactive = false)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .AsQueryable();

    
        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }


        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

   
        if (!string.IsNullOrWhiteSpace(paginationParams.SearchTerm))
        {
            var searchTerm = paginationParams.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.Description.ToLower().Contains(searchTerm));
        }


        query = paginationParams.SortBy?.ToLower() switch
        {
            "name" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
            "price" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.Price)
                : query.OrderBy(p => p.Price),
            "createdat" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }
    /*
    public async Task<PagedResult<ProductDto>> GetAllAsync(PaginationParams paginationParams, int? categoryId = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive)
            .AsQueryable();

        // Filtriranje po kategoriji
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        // Pretraga po imenu ili opisu
        if (!string.IsNullOrWhiteSpace(paginationParams.SearchTerm))
        {
            var searchTerm = paginationParams.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.Description.ToLower().Contains(searchTerm));
        }

        // Sortiranje
        query = paginationParams.SortBy?.ToLower() switch
        {
            "name" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
            "price" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.Price)
                : query.OrderBy(p => p.Price),
            "createdat" => paginationParams.SortDescending
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }*/

    public async Task<ProductDto> GetByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Reviews.Where(r => r.IsApproved))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException(nameof(Product), id);

        return MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
  
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            throw new BadRequestException($"Kategorija sa ID {dto.CategoryId} ne postoji.");

        if (dto.Price <= 0)
            throw new BadRequestException("Cena mora biti veća od 0.");

        if (dto.StockQuantity < 0)
            throw new BadRequestException("Količina na zalihama ne može biti negativna.");

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Images = dto.Images.Select(img => new ProductImage
            {
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary,
                DisplayOrder = img.DisplayOrder
            }).ToList()
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException(nameof(Product), id);

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            throw new BadRequestException($"Kategorija sa ID {dto.CategoryId} ne postoji.");

        if (dto.Price <= 0)
            throw new BadRequestException("Cena mora biti veća od 0.");

        if (dto.StockQuantity < 0)
            throw new BadRequestException("Količina na zalihama ne može biti negativna.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.CategoryId = dto.CategoryId;
        product.IsActive = dto.IsActive;

       
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
        {
         
            if (product.Images.Any())
            {
                _context.ProductImages.RemoveRange(product.Images);
            }

            
            product.Images.Add(new ProductImage
            {
                ImageUrl = dto.ImageUrl,
                IsPrimary = true,
                DisplayOrder = 1
            });
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }
    public async Task DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            throw new NotFoundException(nameof(Product), id);

        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            product.IsActive = false;
            await _context.SaveChangesAsync();
            return;
        }

       
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
        {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            IsPrimary = i.IsPrimary,
            DisplayOrder = i.DisplayOrder
        }).ToList(),
        AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
        ReviewCount = p.Reviews.Count
    };
}