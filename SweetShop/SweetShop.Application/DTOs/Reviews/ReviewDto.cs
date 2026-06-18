namespace SweetShop.Application.DTOs.Reviews;

public class ReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }

    // Customer info
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;

    // Product info
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
}