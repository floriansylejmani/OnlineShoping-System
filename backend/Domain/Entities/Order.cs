using OnlineShop.Domain.Common;
using OnlineShop.Domain.Enums;

namespace OnlineShop.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
    public Payment? Payment { get; set; }
}
