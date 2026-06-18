namespace SweetShop.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Category info
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    // Slike - lista URL-ova
    public List<ProductImageDto> Images { get; set; } = new();

    // Recenzije - prosečna ocena i broj
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}