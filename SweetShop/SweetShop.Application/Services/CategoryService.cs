using Microsoft.EntityFrameworkCore;
using SweetShop.Application.DTOs.Categories;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Exceptions;
using SweetShop.Application.Interfaces;

namespace SweetShop.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;

    public CategoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        return await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException(nameof(Category), id);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = category.Products.Count
        };
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
       
        var exists = await _context.Categories.AnyAsync(c => c.Name == dto.Name);
        if (exists)
            throw new BadRequestException($"Kategorija sa nazivom '{dto.Name}' već postoji.");

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = 0
        };
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            throw new NotFoundException(nameof(Category), id);

      
        var duplicate = await _context.Categories
            .AnyAsync(c => c.Name == dto.Name && c.Id != id);
        if (duplicate)
            throw new BadRequestException($"Druga kategorija sa nazivom '{dto.Name}' već postoji.");

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();

        var productCount = await _context.Products.CountAsync(p => p.CategoryId == id);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = productCount
        };
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException(nameof(Category), id);

      
        if (category.Products.Any())
            throw new BadRequestException(
                $"Kategorija '{category.Name}' ne može biti obrisana jer sadrži {category.Products.Count} proizvoda.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}