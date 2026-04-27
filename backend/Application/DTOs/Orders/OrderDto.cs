using OnlineShop.Application.DTOs.Payments;

namespace OnlineShop.Application.DTOs.Orders;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<OrderItemDto> Items { get; set; } = [];
    public PaymentDto? Payment { get; set; }
}
