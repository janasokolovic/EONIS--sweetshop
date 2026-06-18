using Microsoft.EntityFrameworkCore;
using SweetShop.Application.DTOs.ShippingAddresses;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Exceptions;

namespace SweetShop.Application.Services;

public class ShippingAddressService : IShippingAddressService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ShippingAddressService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<ShippingAddressDetailsDto>> GetCurrentCustomerAddressesAsync()
    {
        var customerId = GetCurrentCustomerId();

        return await _context.ShippingAddresses
            .Where(sa => sa.CustomerId == customerId)
            .OrderByDescending(sa => sa.IsDefault)
            .ThenBy(sa => sa.Id)
            .Select(sa => MapToDto(sa))
            .ToListAsync();
    }

    public async Task<ShippingAddressDetailsDto> GetByIdAsync(int id)
    {
        var customerId = GetCurrentCustomerId();

        var address = await _context.ShippingAddresses
            .FirstOrDefaultAsync(sa => sa.Id == id && sa.CustomerId == customerId);

        if (address == null)
            throw new NotFoundException(nameof(ShippingAddress), id);

        return MapToDto(address);
    }

    public async Task<ShippingAddressDetailsDto> CreateAsync(CreateShippingAddressDto dto)
    {
        var customerId = GetCurrentCustomerId();

        // Ako je ova adresa default, isključi default na svim drugim adresama
        if (dto.IsDefault)
            await ClearDefaultAddressesAsync(customerId);

        var address = new ShippingAddress
        {
            CustomerId = customerId,
            RecipientName = dto.RecipientName,
            Street = dto.Street,
            City = dto.City,
            PostalCode = dto.PostalCode,
            Country = dto.Country,
            PhoneNumber = dto.PhoneNumber,
            IsDefault = dto.IsDefault
        };

        _context.ShippingAddresses.Add(address);
        await _context.SaveChangesAsync();

        return MapToDto(address);
    }

    public async Task<ShippingAddressDetailsDto> UpdateAsync(int id, UpdateShippingAddressDto dto)
    {
        var customerId = GetCurrentCustomerId();

        var address = await _context.ShippingAddresses
            .FirstOrDefaultAsync(sa => sa.Id == id && sa.CustomerId == customerId);

        if (address == null)
            throw new NotFoundException(nameof(ShippingAddress), id);

        // Ako je ova adresa postala default, isključi default na svim drugim
        if (dto.IsDefault && !address.IsDefault)
            await ClearDefaultAddressesAsync(customerId);

        address.RecipientName = dto.RecipientName;
        address.Street = dto.Street;
        address.City = dto.City;
        address.PostalCode = dto.PostalCode;
        address.Country = dto.Country;
        address.PhoneNumber = dto.PhoneNumber;
        address.IsDefault = dto.IsDefault;

        await _context.SaveChangesAsync();

        return MapToDto(address);
    }

    public async Task DeleteAsync(int id)
    {
        var customerId = GetCurrentCustomerId();

        var address = await _context.ShippingAddresses
            .FirstOrDefaultAsync(sa => sa.Id == id && sa.CustomerId == customerId);

        if (address == null)
            throw new NotFoundException(nameof(ShippingAddress), id);

        // Provera da li je adresa povezana sa nekom porudžbinom
        var isUsed = await _context.Orders.AnyAsync(o => o.ShippingAddressId == id);
        if (isUsed)
            throw new BadRequestException(
                "Adresa ne može biti obrisana jer je povezana sa postojećim porudžbinama.");

        _context.ShippingAddresses.Remove(address);
        await _context.SaveChangesAsync();
    }

    // ============= PRIVATE HELPERS =============

    private int GetCurrentCustomerId()
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedException("Korisnik nije prijavljen.");

        return _currentUser.UserId.Value;
    }

    private async Task ClearDefaultAddressesAsync(int customerId)
    {
        var defaultAddresses = await _context.ShippingAddresses
            .Where(sa => sa.CustomerId == customerId && sa.IsDefault)
            .ToListAsync();

        foreach (var addr in defaultAddresses)
            addr.IsDefault = false;
    }

    private static ShippingAddressDetailsDto MapToDto(ShippingAddress sa) => new()
    {
        Id = sa.Id,
        RecipientName = sa.RecipientName,
        Street = sa.Street,
        City = sa.City,
        PostalCode = sa.PostalCode,
        Country = sa.Country,
        PhoneNumber = sa.PhoneNumber,
        IsDefault = sa.IsDefault
    };
}