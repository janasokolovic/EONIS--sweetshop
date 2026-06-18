namespace SweetShop.Domain.Entities;

public class Customer : User
{
    // Navigacijske kolekcije - veze ka drugim entitetima
    public Cart? Cart { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<ShippingAddress> ShippingAddresses { get; set; } = new List<ShippingAddress>();
}