using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Orders;

namespace OnlineShop.Application.Interfaces;

public interface IOrderService
{
    Task<Result<PagedResult<OrderDto>>> GetAllAsync(int page, int pageSize);
    Task<Result<IReadOnlyList<OrderDto>>> GetByUserAsync(Guid userId);
    Task<Result<OrderDto>> GetByIdAsync(Guid id);
    Task<Result<OrderDto>> GetByIdForUserAsync(Guid id, Guid userId, bool isAdmin);
    Task<Result<OrderDto>> CreateFromCartAsync(Guid userId);
    Task<Result<OrderDto>> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request);
    Task<Result> CancelAsync(Guid id, Guid userId);
}
