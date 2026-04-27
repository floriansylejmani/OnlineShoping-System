using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Cart;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;

    public CartService(ApplicationDbContext context) => _context = context;

    public async Task<Result<CartDto>> GetCartAsync(Guid userId)
    {
        var cart = await LoadCartAsync(userId);
        return Result<CartDto>.Success(MapToDto(cart));
    }

    public async Task<Result<CartDto>> AddItemAsync(Guid userId, AddToCartRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);

        if (product is null || !product.IsActive)
            return Result<CartDto>.Failure("Product not found.");

        var cart = await LoadCartAsync(userId);

        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existing is not null)
        {
            var newQty = existing.Quantity + request.Quantity;
            if (product.StockQuantity < newQty)
                return Result<CartDto>.Failure($"Only {product.StockQuantity} unit(s) available.");

            existing.Quantity = newQty;
        }
        else
        {
            if (product.StockQuantity < request.Quantity)
                return Result<CartDto>.Failure($"Only {product.StockQuantity} unit(s) available.");

            _context.CartItems.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            });
        }

        await _context.SaveChangesAsync();

        // Reload to get fresh product navigation data
        var updated = await LoadCartAsync(userId);
        return Result<CartDto>.Success(MapToDto(updated));
    }

    public async Task<Result<CartDto>> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item is null)
            return Result<CartDto>.Failure("Cart item not found.");

        if (item.Product.StockQuantity < request.Quantity)
            return Result<CartDto>.Failure($"Only {item.Product.StockQuantity} unit(s) available.");

        item.Quantity = request.Quantity;
        await _context.SaveChangesAsync();

        return Result<CartDto>.Success(MapToDto(cart));
    }

    public async Task<Result> RemoveItemAsync(Guid userId, Guid cartItemId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
            return Result.Failure("Cart not found.");

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item is null)
            return Result.Failure("Cart item not found.");

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> ClearCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
            return Result.Failure("Cart not found.");

        _context.CartItems.RemoveRange(cart.Items);
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    // Loads the cart with items+product; creates an empty cart if none exists
    private async Task<Cart> LoadCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private static CartDto MapToDto(Cart cart) => new()
    {
        Id = cart.Id,
        UserId = cart.UserId,
        Items = cart.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductImageUrl = i.Product?.ImageUrl ?? string.Empty,
            UnitPrice = i.Product?.Price ?? 0,
            Quantity = i.Quantity,
            Subtotal = (i.Product?.Price ?? 0) * i.Quantity
        }).ToList(),
        Total = cart.Items.Sum(i => (i.Product?.Price ?? 0) * i.Quantity)
    };
}
