using SweetShop.Application.DTOs.Reviews;

namespace SweetShop.Application.Interfaces;

public interface IReviewService
{
    // Public - dobijanje recenzija za proizvod (samo odobrene)
    Task<List<ReviewDto>> GetProductReviewsAsync(int productId);

    // Customer
    Task<ReviewDto> CreateAsync(CreateReviewDto dto);
    Task<ReviewDto> UpdateAsync(int id, UpdateReviewDto dto);
    Task DeleteAsync(int id);

    // Admin
    Task<List<ReviewDto>> GetPendingReviewsAsync();
    Task<ReviewDto> ApproveAsync(int id);
    Task RejectAsync(int id);
}