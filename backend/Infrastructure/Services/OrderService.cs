using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Orders;
using OnlineShop.Application.DTOs.Payments;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Domain.Enums;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context) => _context = context;

    public async Task<Result<PagedResult<OrderDto>>> GetAllAsync(int page, int pageSize)
    {
        var total = await _context.Orders.CountAsync();

        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Result<PagedResult<OrderDto>>.Success(
            new PagedResult<OrderDto>(orders.ConvertAll(MapToDto), total, page, pageSize));
    }

    public async Task<Result<IReadOnlyList<OrderDto>>> GetByUserAsync(Guid userId)
    {
        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Result<IReadOnlyList<OrderDto>>.Success(orders.ConvertAll(MapToDto));
    }

    public async Task<Result<OrderDto>> GetByIdAsync(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return Result<OrderDto>.Failure("Order not found.");

        return Result<OrderDto>.Success(MapToDto(order));
    }

    public async Task<Result<OrderDto>> CreateFromCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null || cart.Items.Count == 0)
            return Result<OrderDto>.Failure("Cart is empty.");

        // Verify stock for every item before touching anything
        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Product.StockQuantity < cartItem.Quantity)
                return Result<OrderDto>.Failure(
                    $"Insufficient stock for '{cartItem.Product.Name}'. " +
                    $"Available: {cartItem.Product.StockQuantity}.");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            TotalAmount = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.Product.Price     // snapshot price at time of order
            }).ToList()
        };

        // Decrement stock
        foreach (var cartItem in cart.Items)
        {
            cartItem.Product.StockQuantity -= cartItem.Quantity;
            cartItem.Product.UpdatedAt = DateTime.UtcNow;
        }

        // Clear the cart
        _context.CartItems.RemoveRange(cart.Items);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Reload product names for the response
        foreach (var item in order.Items)
            await _context.Entry(item).Reference(i => i.Product).LoadAsync();

        return Result<OrderDto>.Success(MapToDto(order));
    }

    public async Task<Result<OrderDto>> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return Result<OrderDto>.Failure("Order not found.");

        if (!Enum.TryParse<OrderStatus>(request.Status, out var newStatus))
            return Result<OrderDto>.Failure("Invalid order status.");

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result<OrderDto>.Success(MapToDto(order));
    }

    public async Task<Result> CancelAsync(Guid id, Guid userId)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order is null)
            return Result.Failure("Order not found.");

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Processing))
            return Result.Failure("Only pending or processing orders can be cancelled.");

        // Restore stock
        foreach (var item in order.Items)
        {
            item.Product.StockQuantity += item.Quantity;
            item.Product.UpdatedAt = DateTime.UtcNow;
        }

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    private static OrderDto MapToDto(Order o) => new()
    {
        Id = o.Id,
        UserId = o.UserId,
        Status = o.Status.ToString(),
        TotalAmount = o.TotalAmount,
        CreatedAt = o.CreatedAt,
        Items = o.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            Subtotal = i.UnitPrice * i.Quantity
        }).ToList(),
        Payment = o.Payment is null ? null : new PaymentDto
        {
            Id = o.Payment.Id,
            OrderId = o.Payment.OrderId,
            Status = o.Payment.Status.ToString(),
            Amount = o.Payment.Amount,
            PaidAt = o.Payment.PaidAt
        }
    };
}
