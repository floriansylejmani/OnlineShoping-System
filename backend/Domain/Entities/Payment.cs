using OnlineShop.Domain.Common;
using OnlineShop.Domain.Enums;

namespace OnlineShop.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public DateTime? PaidAt { get; set; }
}
