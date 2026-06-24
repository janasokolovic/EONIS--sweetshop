namespace SweetShop.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; } = false;


    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

   
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}