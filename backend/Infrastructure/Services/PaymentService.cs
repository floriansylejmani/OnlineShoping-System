using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Payments;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Domain.Enums;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context) => _context = context;

    public async Task<Result<PaymentDto>> GetByOrderIdAsync(Guid orderId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.OrderId == orderId);

        if (payment is null)
            return Result<PaymentDto>.Failure("Payment not found for this order.");

        return Result<PaymentDto>.Success(MapToDto(payment));
    }

    public async Task<Result<PaymentDto>> ProcessAsync(Guid userId, CreatePaymentRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId);

        if (order is null)
            return Result<PaymentDto>.Failure("Order not found.");

        if (order.Status == OrderStatus.Cancelled)
            return Result<PaymentDto>.Failure("Cannot pay for a cancelled order.");

        if (order.Payment is not null)
            return Result<PaymentDto>.Failure("This order has already been paid.");

        var payment = new Payment
        {
            OrderId = order.Id,
            Amount = order.TotalAmount,
            Status = PaymentStatus.Paid,
            PaidAt = DateTime.UtcNow
        };

        order.Status = OrderStatus.Processing;
        order.UpdatedAt = DateTime.UtcNow;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Result<PaymentDto>.Success(MapToDto(payment));
    }

    private static PaymentDto MapToDto(Payment p) => new()
    {
        Id = p.Id,
        OrderId = p.OrderId,
        Status = p.Status.ToString(),
        Amount = p.Amount,
        PaidAt = p.PaidAt
    };
}
