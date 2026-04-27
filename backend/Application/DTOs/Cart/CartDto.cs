namespace OnlineShop.Application.DTOs.Cart;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public IReadOnlyList<CartItemDto> Items { get; set; } = [];
    public decimal Total { get; set; }
}
