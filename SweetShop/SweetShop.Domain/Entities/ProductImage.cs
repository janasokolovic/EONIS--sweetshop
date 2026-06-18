namespace SweetShop.Domain.Entities;

public class ProductImage
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }

    // Foreign key - svaka slika pripada jednom proizvodu
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}