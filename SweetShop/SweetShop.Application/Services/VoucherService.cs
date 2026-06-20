using Microsoft.EntityFrameworkCore;
using SweetShop.Application.DTOs.Vouchers;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Exceptions;

namespace SweetShop.Application.Services;

public class VoucherService : IVoucherService
{
    private readonly IApplicationDbContext _context;

    public VoucherService(IApplicationDbContext context)
    {
        _context = context;
    }

    // ============== ADMIN ==============

    public async Task<List<VoucherDto>> GetAllAsync()
    {
        var vouchers = await _context.Vouchers
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return vouchers.Select(MapToDto).ToList();
    }

    public async Task<VoucherDto> GetByIdAsync(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
            throw new NotFoundException(nameof(Voucher), id);

        return MapToDto(voucher);
    }

    public async Task<VoucherDto> CreateAsync(CreateVoucherDto dto)
    {
        // Validacije
        if (string.IsNullOrWhiteSpace(dto.Code))
            throw new BadRequestException("Kod ne sme biti prazan.");

        if (dto.DiscountValue <= 0)
            throw new BadRequestException("Vrednost popusta mora biti veća od 0.");

        if (dto.IsPercentage && dto.DiscountValue > 100)
            throw new BadRequestException("Procenat popusta ne može biti veći od 100%.");

        if (dto.ValidUntil <= dto.ValidFrom)
            throw new BadRequestException("Datum isteka mora biti posle datuma početka.");

        // Code mora biti unikatan
        var normalizedCode = dto.Code.Trim().ToUpper();
        var exists = await _context.Vouchers.AnyAsync(v => v.Code == normalizedCode);
        if (exists)
            throw new BadRequestException($"Voucher sa kodom '{normalizedCode}' već postoji.");

        var voucher = new Voucher
        {
            Code = normalizedCode,
            Description = dto.Description,
            IsPercentage = dto.IsPercentage,
            DiscountValue = dto.DiscountValue,
            ValidFrom = dto.ValidFrom,
            ValidUntil = dto.ValidUntil,
            MinOrderAmount = dto.MinOrderAmount,
            MaxUsageCount = dto.MaxUsageCount,
            CurrentUsageCount = 0,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        return MapToDto(voucher);
    }

    public async Task<VoucherDto> UpdateAsync(int id, UpdateVoucherDto dto)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
            throw new NotFoundException(nameof(Voucher), id);

        // Validacije
        if (dto.DiscountValue <= 0)
            throw new BadRequestException("Vrednost popusta mora biti veća od 0.");

        if (dto.IsPercentage && dto.DiscountValue > 100)
            throw new BadRequestException("Procenat popusta ne može biti veći od 100%.");

        if (dto.ValidUntil <= dto.ValidFrom)
            throw new BadRequestException("Datum isteka mora biti posle datuma početka.");

        var normalizedCode = dto.Code.Trim().ToUpper();
        // Ako je promenjen kod, proveri da nije već zauzet
        if (voucher.Code != normalizedCode)
        {
            var exists = await _context.Vouchers.AnyAsync(v => v.Code == normalizedCode && v.Id != id);
            if (exists)
                throw new BadRequestException($"Voucher sa kodom '{normalizedCode}' već postoji.");
        }

        voucher.Code = normalizedCode;
        voucher.Description = dto.Description;
        voucher.IsPercentage = dto.IsPercentage;
        voucher.DiscountValue = dto.DiscountValue;
        voucher.ValidFrom = dto.ValidFrom;
        voucher.ValidUntil = dto.ValidUntil;
        voucher.MinOrderAmount = dto.MinOrderAmount;
        voucher.MaxUsageCount = dto.MaxUsageCount;
        voucher.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return MapToDto(voucher);
    }

    public async Task DeleteAsync(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
            throw new NotFoundException(nameof(Voucher), id);

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
    }

    // ============== CUSTOMER ==============

    public async Task<VoucherCalculationDto> ApplyVoucherAsync(ApplyVoucherDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            throw new BadRequestException("Unesite voucher kod.");

        var normalizedCode = dto.Code.Trim().ToUpper();
        var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == normalizedCode);

        if (voucher == null)
            throw new NotFoundException($"Voucher sa kodom '{normalizedCode}' ne postoji.");

        // Validacije
        if (!voucher.IsActive)
            throw new BadRequestException("Voucher nije aktivan.");

        var now = DateTime.UtcNow;
        if (now < voucher.ValidFrom)
            throw new BadRequestException($"Voucher još nije aktivan. Postaje važeći {voucher.ValidFrom:dd.MM.yyyy}.");

        if (now > voucher.ValidUntil)
            throw new BadRequestException("Voucher je istekao.");

        if (voucher.MaxUsageCount.HasValue && voucher.CurrentUsageCount >= voucher.MaxUsageCount.Value)
            throw new BadRequestException("Voucher je iskoristio maksimalan broj korišćenja.");

        if (voucher.MinOrderAmount.HasValue && dto.OrderSubtotal < voucher.MinOrderAmount.Value)
            throw new BadRequestException(
                $"Minimalna vrednost porudžbine za ovaj voucher je {voucher.MinOrderAmount.Value:F2}€. " +
                $"Trenutni iznos je {dto.OrderSubtotal:F2}€.");

        // Kalkulacija popusta
        decimal discountAmount;
        if (voucher.IsPercentage)
        {
            discountAmount = Math.Round(dto.OrderSubtotal * (voucher.DiscountValue / 100m), 2);
        }
        else
        {
            // Fiksni iznos, ali ne više od subtotal-a (da ne ide u negativu)
            discountAmount = Math.Min(voucher.DiscountValue, dto.OrderSubtotal);
        }

        var finalAmount = dto.OrderSubtotal - discountAmount;

        return new VoucherCalculationDto
        {
            Code = voucher.Code,
            Description = voucher.Description ?? string.Empty,
            OriginalAmount = dto.OrderSubtotal,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            IsValid = true,
            Message = voucher.IsPercentage
                ? $"Popust od {voucher.DiscountValue}% primenjen."
                : $"Popust od {voucher.DiscountValue}€ primenjen."
        };
    }

    public async Task IncrementUsageCountAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return;

        var normalizedCode = code.Trim().ToUpper();
        var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == normalizedCode);

        if (voucher != null)
        {
            voucher.CurrentUsageCount++;
            await _context.SaveChangesAsync();
        }
    }

    // ============== MAPPING ==============

    private static VoucherDto MapToDto(Voucher v) => new()
    {
        Id = v.Id,
        Code = v.Code,
        Description = v.Description,
        IsPercentage = v.IsPercentage,
        DiscountValue = v.DiscountValue,
        ValidFrom = v.ValidFrom,
        ValidUntil = v.ValidUntil,
        MinOrderAmount = v.MinOrderAmount,
        MaxUsageCount = v.MaxUsageCount,
        CurrentUsageCount = v.CurrentUsageCount,
        IsActive = v.IsActive,
        CreatedAt = v.CreatedAt
    };
}