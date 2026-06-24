namespace SweetShop.Domain.Entities;

public class Cart
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

 
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

  
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}