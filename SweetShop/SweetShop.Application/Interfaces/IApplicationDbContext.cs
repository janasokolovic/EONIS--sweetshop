using Microsoft.EntityFrameworkCore;
using SweetShop.Domain.Entities;

namespace SweetShop.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Admin> Admins { get; }
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<ShippingAddress> ShippingAddresses { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Review> Reviews { get; }

    DbSet<Voucher> Vouchers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}