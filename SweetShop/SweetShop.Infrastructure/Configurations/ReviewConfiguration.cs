using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SweetShop.Domain.Entities;

namespace SweetShop.Infrastructure.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Rating)
            .IsRequired();

        builder.Property(r => r.Comment)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(r => r.CreatedAt).IsRequired();
        builder.Property(r => r.IsApproved).IsRequired();

        // Veza: Customer 1 -- 0..* Review
        builder.HasOne(r => r.Customer)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Veza: Product 1 -- 0..* Review
        builder.HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Jedan kupac može imati samo JEDNU recenziju po proizvodu
        builder.HasIndex(r => new { r.CustomerId, r.ProductId }).IsUnique();

        // Indeks za brži pregled odobrenih recenzija
        builder.HasIndex(r => r.IsApproved);
    }
}