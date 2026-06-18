using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SweetShop.Domain.Entities;

namespace SweetShop.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<int>(); // Sačuvaj enum kao broj u bazi

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        // Email mora biti jedinstven (unique index)
        builder.HasIndex(u => u.Email)
            .IsUnique();

        // Table-Per-Hierarchy (TPH) inheritance:
        // User, Customer i Admin idu u istu tabelu Users sa "Discriminator" kolonom
        builder.HasDiscriminator<int>("UserType")
            .HasValue<Customer>((int)Domain.Enums.UserRole.Customer)
            .HasValue<Admin>((int)Domain.Enums.UserRole.Admin);
    }
}