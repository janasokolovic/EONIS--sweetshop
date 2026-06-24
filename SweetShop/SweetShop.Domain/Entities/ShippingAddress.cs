namespace SweetShop.Domain.Entities;

public class ShippingAddress
{
    public int Id { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsDefault { get; set; }

    
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}