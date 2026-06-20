using Microsoft.EntityFrameworkCore;
using SweetShop.Application.Common;
using SweetShop.Application.DTOs.Orders;
using SweetShop.Application.Interfaces;
using SweetShop.Domain.Entities;
using SweetShop.Domain.Enums;
using SweetShop.Domain.Exceptions;
using SweetShop.Application.DTOs.Vouchers;

namespace SweetShop.Application.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    private readonly IVoucherService _voucherService;

    public OrderService(IApplicationDbContext context, ICurrentUserService currentUser, IVoucherService voucherService)
    {
        _context = context;
        _currentUser = currentUser;
        _voucherService = voucherService;
    }

    // ============= CUSTOMER METHODS =============

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
    {
        var customerId = GetCurrentCustomerId();

        // 1. Pronađi korpu kupca sa svim stavkama i proizvodima
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null || !cart.Items.Any())
            throw new BadRequestException("Korpa je prazna. Dodajte proizvode pre kreiranja porudžbine.");

        // 2. Validacija adrese - mora pripadati ovom kupcu
        var address = await _context.ShippingAddresses
            .FirstOrDefaultAsync(sa => sa.Id == dto.ShippingAddressId && sa.CustomerId == customerId);

        if (address == null)
            throw new BadRequestException($"Adresa sa ID {dto.ShippingAddressId} ne postoji ili ne pripada vama.");

        // 3. BIZNIS PRAVILO: Proveri da li ima dovoljno na zalihama za svaku stavku
        foreach (var item in cart.Items)
        {
            if (item.Product == null || !item.Product.IsActive)
                throw new BadRequestException($"Proizvod '{item.Product?.Name ?? "nepoznat"}' nije više dostupan.");

            if (item.Quantity > item.Product.StockQuantity)
                throw new BadRequestException(
                    $"Proizvod '{item.Product.Name}': tražite {item.Quantity}, " +
                    $"a na zalihama je samo {item.Product.StockQuantity}.");
        }

        // 4. Izračunaj subtotal
        var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        decimal discountAmount = 0;
        string? appliedVoucherCode = null;

        // 5. Primeni voucher ako je zadat
        if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
        {
            var voucherResult = await _voucherService.ApplyVoucherAsync(new ApplyVoucherDto
            {
                Code = dto.VoucherCode,
                OrderSubtotal = subtotal
            });

            discountAmount = voucherResult.DiscountAmount;
            appliedVoucherCode = voucherResult.Code;
        }

        var totalAmount = subtotal - discountAmount;

        // 6. Kreiraj porudžbinu
        var order = new Order
        {
            CustomerId = customerId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Pending,
            ShippingAddressId = dto.ShippingAddressId,
            SubtotalAmount = subtotal,
            DiscountAmount = discountAmount,
            VoucherCode = appliedVoucherCode,
            TotalAmount = totalAmount,
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                ProductName = i.Product!.Name,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        _context.Orders.Add(order);

        // 7. BIZNIS PRAVILO: Smanji zalihe za svaki proizvod
        foreach (var item in cart.Items)
        {
            item.Product!.StockQuantity -= item.Quantity;
        }

        // 8. Inkrementuj broj korišćenja voucher-a (ako je korišćen)
        if (!string.IsNullOrWhiteSpace(appliedVoucherCode))
        {
            await _voucherService.IncrementUsageCountAsync(appliedVoucherCode);
        }

        // 9. Isprazni korpu
        foreach (var item in cart.Items.ToList())
        {
            _context.CartItems.Remove(item);
        }
        cart.Items.Clear();
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(order.Id);
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync()
    {
        var customerId = GetCurrentCustomerId();

        var orders = await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .Include(o => o.Customer)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .Include(o => o.Payment)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<OrderDto> GetByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new NotFoundException(nameof(Order), id);

        // Security: ako je korisnik Customer, mora videti samo svoje porudžbine
        // Admin može videti sve
        var role = _currentUser.Role;
        if (role != "Admin" && order.CustomerId != _currentUser.UserId)
            throw new UnauthorizedException("Nemate dozvolu za pregled ove porudžbine.");

        return MapToDto(order);
    }

    // ============= ADMIN METHODS =============

    public async Task<PagedResult<OrderDto>> GetAllAsync(PaginationParams paginationParams)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .Include(o => o.Payment)
            .AsQueryable();

        // Pretraga po imenu kupca ili email-u
        if (!string.IsNullOrWhiteSpace(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            query = query.Where(o =>
                o.Customer.FirstName.ToLower().Contains(term) ||
                o.Customer.LastName.ToLower().Contains(term) ||
                o.Customer.Email.ToLower().Contains(term));
        }

        // Sortiranje
        query = paginationParams.SortBy?.ToLower() switch
        {
            "orderdate" => paginationParams.SortDescending
                ? query.OrderByDescending(o => o.OrderDate)
                : query.OrderBy(o => o.OrderDate),
            "totalamount" => paginationParams.SortDescending
                ? query.OrderByDescending(o => o.TotalAmount)
                : query.OrderBy(o => o.TotalAmount),
            "status" => paginationParams.SortDescending
                ? query.OrderByDescending(o => o.Status)
                : query.OrderBy(o => o.Status),
            _ => query.OrderByDescending(o => o.OrderDate)
        };

        var totalCount = await query.CountAsync();

        var orders = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync();

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<OrderDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new NotFoundException(nameof(Order), id);

        // Biznis pravilo: Ne dozvoli unazadno menjanje statusa
        if (order.Status == OrderStatus.Delivered || order.Status == OrderStatus.Cancelled)
            throw new BadRequestException(
                $"Porudžbina sa statusom '{order.Status}' ne može više biti izmenjena.");

        // Ako se otkazuje porudžbina (a već je plaćena), vrati zalihe
        if (dto.Status == OrderStatus.Cancelled && order.Status != OrderStatus.Pending)
        {
            foreach (var item in order.Items)
            {
                if (item.Product != null)
                    item.Product.StockQuantity += item.Quantity;
            }
        }

        order.Status = dto.Status;
        await _context.SaveChangesAsync();

        return await GetByIdAsync(order.Id);
    }

    // ============= PRIVATE HELPERS =============

    private int GetCurrentCustomerId()
    {
        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedException("Korisnik nije prijavljen.");

        return _currentUser.UserId.Value;
    }

    private static OrderDto MapToDto(Order order) => new()
    {
        Id = order.Id,
        OrderDate = order.OrderDate,
        Status = order.Status.ToString(),
        TotalAmount = order.TotalAmount,
        SubtotalAmount = order.SubtotalAmount,
        DiscountAmount = order.DiscountAmount,
        VoucherCode = order.VoucherCode,
        CustomerId = order.CustomerId,
        CustomerName = $"{order.Customer?.FirstName} {order.Customer?.LastName}".Trim(),
        CustomerEmail = order.Customer?.Email ?? string.Empty,
        ShippingAddress = order.ShippingAddress == null ? null! : new ShippingAddressDto
        {
            RecipientName = order.ShippingAddress.RecipientName,
            Street = order.ShippingAddress.Street,
            City = order.ShippingAddress.City,
            PostalCode = order.ShippingAddress.PostalCode,
            Country = order.ShippingAddress.Country,
            PhoneNumber = order.ShippingAddress.PhoneNumber
        },
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductImageUrl = i.Product?.Images
                .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                ?? i.Product?.Images.FirstOrDefault()?.ImageUrl,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            Subtotal = i.UnitPrice * i.Quantity
        }).ToList(),
        Payment = order.Payment == null ? null : new PaymentInfoDto
        {
            StripePaymentIntentId = order.Payment.StripePaymentIntentId,
            Amount = order.Payment.Amount,
            Currency = order.Payment.Currency,
            Status = order.Payment.Status.ToString(),
            PaidAt = order.Payment.PaidAt
        }
    };
}