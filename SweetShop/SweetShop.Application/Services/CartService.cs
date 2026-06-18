using Microsoft.EntityFrameworkCore;
using SweetShop.Application.DTOs.Cart;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Exceptions;

namespace SweetShop.Application.Services;

public class CartService : ICartService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CartService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CartDto> GetCurrentCartAsync()
    {
        var customerId = GetCurrentCustomerId();
        var cart = await GetOrCreateCartAsync(customerId);
        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(AddToCartDto dto)
    {
        if (dto.Quantity <= 0)
            throw new BadRequestException("Količina mora biti veća od 0.");

        var customerId = GetCurrentCustomerId();
        var cart = await GetOrCreateCartAsync(customerId);

        // Pronađi proizvod sa zalihama
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.IsActive);

        if (product == null)
            throw new NotFoundException(nameof(Product), dto.ProductId);

        // Pronađi postojeću stavku u korpi (ako postoji)
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

        // Izračunaj ukupnu količinu (postojeća + nova)
        var totalQuantity = (existingItem?.Quantity ?? 0) + dto.Quantity;

        // BIZNIS PRAVILO: ne dozvoli više nego što ima na zalihama
        if (totalQuantity > product.StockQuantity)
            throw new BadRequestException(
                $"Nedovoljna količina na zalihama. Trenutno imate {existingItem?.Quantity ?? 0} u korpi, " +
                $"pokušavate da dodate {dto.Quantity}, a na stanju je samo {product.StockQuantity}.");

        if (existingItem != null)
        {
            // Ažuriraj postojeću stavku
            existingItem.Quantity = totalQuantity;
        }
        else
        {
            // Kreiraj novu stavku
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            };
            _context.CartItems.Add(newItem);
            cart.Items.Add(newItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(cart);
    }

    public async Task<CartDto> UpdateItemAsync(int itemId, UpdateCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            throw new BadRequestException("Količina mora biti veća od 0.");

        var customerId = GetCurrentCustomerId();
        var cart = await GetOrCreateCartAsync(customerId);

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new NotFoundException(nameof(CartItem), itemId);

        // Provera zaliha
        var product = await _context.Products.FindAsync(item.ProductId);
        if (product == null || !product.IsActive)
            throw new BadRequestException("Proizvod nije više dostupan.");

        if (dto.Quantity > product.StockQuantity)
            throw new BadRequestException(
                $"Tražena količina ({dto.Quantity}) je veća od raspoložive na zalihama ({product.StockQuantity}).");

        item.Quantity = dto.Quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(cart);
    }

    public async Task<CartDto> RemoveItemAsync(int itemId)
    {
        var customerId = GetCurrentCustomerId();
        var cart = await GetOrCreateCartAsync(customerId);

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new NotFoundException(nameof(CartItem), itemId);

        _context.CartItems.Remove(item);
        cart.Items.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(cart);
    }

    public async Task ClearCartAsync()
    {
        var customerId = GetCurrentCustomerId();
        var cart = await GetOrCreateCartAsync(customerId);

        foreach (var item in cart.Items.ToList())
        {
            _context.CartItems.Remove(item);
        }
        cart.Items.Clear();
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    // ============= PRIVATE HELPERS =============

    private int GetCurrentCustomerId()
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedException("Korisnik nije prijavljen.");

        return _currentUser.UserId.Value;
    }

    private async Task<Cart> GetOrCreateCartAsync(int customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private static CartDto MapToDto(Cart cart) => new()
    {
        Id = cart.Id,
        CustomerId = cart.CustomerId,
        Items = cart.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductImageUrl = i.Product?.Images
                .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                ?? i.Product?.Images.FirstOrDefault()?.ImageUrl,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            Subtotal = i.UnitPrice * i.Quantity,
            AvailableStock = i.Product?.StockQuantity ?? 0
        }).ToList(),
        TotalPrice = cart.Items.Sum(i => i.UnitPrice * i.Quantity),
        TotalItems = cart.Items.Sum(i => i.Quantity)
    };
}