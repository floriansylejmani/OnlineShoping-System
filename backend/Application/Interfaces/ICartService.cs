using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Cart;

namespace OnlineShop.Application.Interfaces;

public interface ICartService
{
    Task<Result<CartDto>> GetCartAsync(Guid userId);
    Task<Result<CartDto>> AddItemAsync(Guid userId, AddToCartRequest request);
    Task<Result<CartDto>> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request);
    Task<Result> RemoveItemAsync(Guid userId, Guid cartItemId);
    Task<Result> ClearCartAsync(Guid userId);
}
