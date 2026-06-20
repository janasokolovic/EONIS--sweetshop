using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SweetShop.Domain.Entities;

namespace SweetShop.Infrastructure.Configurations;

public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
{
    public void Configure(EntityTypeBuilder<Voucher> builder)
    {
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Code)
            .IsRequired()
            .HasMaxLength(50);

        // Code mora biti UNIKATAN
        builder.HasIndex(v => v.Code).IsUnique();

        builder.Property(v => v.Description)
            .HasMaxLength(500);

        builder.Property(v => v.DiscountValue)
            .HasPrecision(18, 2);

        builder.Property(v => v.MinOrderAmount)
            .HasPrecision(18, 2);
    }
}