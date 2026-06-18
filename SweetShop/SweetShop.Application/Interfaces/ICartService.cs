using SweetShop.Application.DTOs.Cart;

namespace SweetShop.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCurrentCartAsync();
    Task<CartDto> AddItemAsync(AddToCartDto dto);
    Task<CartDto> UpdateItemAsync(int itemId, UpdateCartItemDto dto);
    Task<CartDto> RemoveItemAsync(int itemId);
    Task ClearCartAsync();
}