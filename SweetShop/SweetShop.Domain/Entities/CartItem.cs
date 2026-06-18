namespace SweetShop.Domain.Entities;

public class CartItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    // Foreign key ka Cart-u
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    // Foreign key ka Product-u
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}