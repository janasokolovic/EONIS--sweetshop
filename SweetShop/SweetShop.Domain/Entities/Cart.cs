namespace SweetShop.Domain.Entities;

public class Cart
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key - jedna korpa pripada jednom kupcu
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    // Navigacija - jedna korpa ima više stavki
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}