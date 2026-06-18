namespace SweetShop.Application.DTOs.Cart;

public class CartDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalPrice { get; set; }
    public int TotalItems { get; set; }
}