using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SweetShop.Domain.Entities;

namespace SweetShop.Infrastructure.Data.Configurations;

public class ShippingAddressConfiguration : IEntityTypeConfiguration<ShippingAddress>
{
    public void Configure(EntityTypeBuilder<ShippingAddress> builder)
    {
        builder.ToTable("ShippingAddresses");

        builder.HasKey(sa => sa.Id);

        builder.Property(sa => sa.RecipientName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(sa => sa.Street)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(sa => sa.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sa => sa.PostalCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(sa => sa.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sa => sa.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(sa => sa.IsDefault).IsRequired();


        builder.HasOne(sa => sa.Customer)
            .WithMany(c => c.ShippingAddresses)
            .HasForeignKey(sa => sa.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sa => sa.CustomerId);
    }
}