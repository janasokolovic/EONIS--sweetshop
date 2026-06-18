using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.DTOs.Reviews;
using SweetShop.Application.Interfaces;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // ============= PUBLIC ENDPOINTS =============

    /// <summary>
    /// Vraća sve odobrene recenzije za proizvod (Public)
    /// </summary>
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetProductReviews(int productId)
    {
        var reviews = await _reviewService.GetProductReviewsAsync(productId);
        return Ok(reviews);
    }

    // ============= CUSTOMER ENDPOINTS =============

    /// <summary>
    /// Ostavlja novu recenziju (Customer)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto)
    {
        var review = await _reviewService.CreateAsync(dto);
        return Ok(review);
    }

    /// <summary>
    /// Ažurira recenziju (Customer - samo svoju)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Update(int id, [FromBody] UpdateReviewDto dto)
    {
        var review = await _reviewService.UpdateAsync(id, dto);
        return Ok(review);
    }

    /// <summary>
    /// Briše recenziju (Customer briše svoju, Admin može bilo koju)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        await _reviewService.DeleteAsync(id);
        return NoContent();
    }

    // ============= ADMIN ENDPOINTS =============

    /// <summary>
    /// Vraća sve recenzije koje čekaju moderaciju (Admin)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ReviewDto>>> GetPendingReviews()
    {
        var reviews = await _reviewService.GetPendingReviewsAsync();
        return Ok(reviews);
    }

    /// <summary>
    /// Odobrava recenziju (Admin)
    /// </summary>
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ReviewDto>> Approve(int id)
    {
        var review = await _reviewService.ApproveAsync(id);
        return Ok(review);
    }

    /// <summary>
    /// Odbacuje recenziju (Admin)
    /// </summary>
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Reject(int id)
    {
        await _reviewService.RejectAsync(id);
        return NoContent();
    }
}