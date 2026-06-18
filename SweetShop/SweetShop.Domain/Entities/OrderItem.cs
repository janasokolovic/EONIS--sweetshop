namespace SweetShop.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    // Foreign key ka Order-u
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    // Foreign key ka Product-u (čuva istorijsku referencu)
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}