using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs.Orders;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class OrdersController : BaseApiController
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders) => _orders = orders;

    /// <summary>Place an order from the current user's cart.</summary>
    [HttpPost]
    public async Task<IActionResult> Create()
    {
        var result = await _orders.CreateFromCartAsync(CurrentUserId);
        return ToResponse(result);
    }

    /// <summary>Get the current user's order history.</summary>
    [HttpGet("my")]
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMy()
    {
        var result = await _orders.GetByUserAsync(CurrentUserId);
        return ToResponse(result);
    }

    /// <summary>Get one order. Customers can only access their own orders.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _orders.GetByIdForUserAsync(id, CurrentUserId, User.IsInRole("Admin"));
        return ToResponse(result);
    }

    /// <summary>Get all orders (paginated). Admin only.</summary>
    [HttpGet]
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _orders.GetAllAsync(page, pageSize);
        return ToResponse(result);
    }

    /// <summary>Update an order's status. Admin only.</summary>
    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _orders.UpdateStatusAsync(id, request);
        return ToResponse(result);
    }

    /// <summary>Cancel an order. Only allowed for Pending or Processing orders.</summary>
    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var result = await _orders.CancelAsync(id, CurrentUserId);
        return ToResponse(result);
    }
}
