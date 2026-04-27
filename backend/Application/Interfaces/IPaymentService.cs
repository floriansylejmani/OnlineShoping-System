using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Payments;

namespace OnlineShop.Application.Interfaces;

public interface IPaymentService
{
    Task<Result<PaymentDto>> GetByOrderIdAsync(Guid orderId);
    Task<Result<PaymentDto>> ProcessAsync(Guid userId, CreatePaymentRequest request);
}
