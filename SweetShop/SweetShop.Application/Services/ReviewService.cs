using Microsoft.EntityFrameworkCore;
using SweetShop.Application.DTOs.Reviews;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Enums;
using SweetShop.Domain.Exceptions;

namespace SweetShop.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ReviewService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }



    public async Task<List<ReviewDto>> GetProductReviewsAsync(int productId)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            throw new NotFoundException(nameof(Product), productId);

        return await _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToDto(r))
            .ToListAsync();
    }



    public async Task<ReviewDto> CreateAsync(CreateReviewDto dto)
    {
        var customerId = GetCurrentCustomerId();

 
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new BadRequestException("Ocena mora biti između 1 i 5.");


        var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
        if (!productExists)
            throw new NotFoundException(nameof(Product), dto.ProductId);

      
        var hasPurchased = await _context.Orders
            .Where(o => o.CustomerId == customerId &&
                       (o.Status == OrderStatus.Paid ||
                        o.Status == OrderStatus.Processing ||
                        o.Status == OrderStatus.Shipped ||
                        o.Status == OrderStatus.Delivered))
            .AnyAsync(o => o.Items.Any(i => i.ProductId == dto.ProductId));

        if (!hasPurchased)
            throw new BadRequestException(
                "Ne možete ostaviti recenziju za proizvod koji niste kupili.");

   
        var alreadyReviewed = await _context.Reviews
            .AnyAsync(r => r.CustomerId == customerId && r.ProductId == dto.ProductId);

        if (alreadyReviewed)
            throw new BadRequestException(
                "Već ste ostavili recenziju za ovaj proizvod. Možete je izmeniti.");

        var review = new Review
        {
            CustomerId = customerId,
            ProductId = dto.ProductId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow,
            IsApproved = false 
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return await GetReviewWithDetailsAsync(review.Id);
    }

    public async Task<ReviewDto> UpdateAsync(int id, UpdateReviewDto dto)
    {
        var customerId = GetCurrentCustomerId();

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new BadRequestException("Ocena mora biti između 1 i 5.");

        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == customerId);

        if (review == null)
            throw new NotFoundException(nameof(Review), id);

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.IsApproved = false; // Posle izmene mora ponovo da prođe moderaciju

        await _context.SaveChangesAsync();

        return await GetReviewWithDetailsAsync(review.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var customerId = GetCurrentCustomerId();
        var role = _currentUser.Role;

        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            throw new NotFoundException(nameof(Review), id);

      
        if (role != "Admin" && review.CustomerId != customerId)
            throw new UnauthorizedException("Nemate dozvolu za brisanje ove recenzije.");

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
    }

  

    public async Task<List<ReviewDto>> GetPendingReviewsAsync()
    {
        return await _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .Where(r => !r.IsApproved)
            .OrderBy(r => r.CreatedAt)
            .Select(r => MapToDto(r))
            .ToListAsync();
    }

    public async Task<ReviewDto> ApproveAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            throw new NotFoundException(nameof(Review), id);

        review.IsApproved = true;
        await _context.SaveChangesAsync();

        return await GetReviewWithDetailsAsync(review.Id);
    }

    public async Task RejectAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            throw new NotFoundException(nameof(Review), id);

        
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
    }

    

    private int GetCurrentCustomerId()
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedException("Korisnik nije prijavljen.");

        return _currentUser.UserId.Value;
    }

    private async Task<ReviewDto> GetReviewWithDetailsAsync(int id)
    {
        var review = await _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .FirstAsync(r => r.Id == id);

        return MapToDto(review);
    }

    private static ReviewDto MapToDto(Review r) => new()
    {
        Id = r.Id,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt,
        IsApproved = r.IsApproved,
        CustomerId = r.CustomerId,
        CustomerName = $"{r.Customer?.FirstName} {r.Customer?.LastName}".Trim(),
        ProductId = r.ProductId,
        ProductName = r.Product?.Name ?? string.Empty
    };
}