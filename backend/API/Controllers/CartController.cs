using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs.Cart;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class CartController : BaseApiController
{
    private readonly ICartService _cart;

    public CartController(ICartService cart) => _cart = cart;

    /// <summary>Get the current user's cart.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var result = await _cart.GetCartAsync(CurrentUserId);
        return ToResponse(result);
    }

    /// <summary>Add a product to the cart (or increment quantity if already present).</summary>
    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
    {
        var result = await _cart.AddItemAsync(CurrentUserId, request);
        return ToResponse(result);
    }

    /// <summary>Update the quantity of a cart item.</summary>
    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateCartItemRequest request)
    {
        var result = await _cart.UpdateItemAsync(CurrentUserId, id, request);
        return ToResponse(result);
    }

    /// <summary>Remove a single item from the cart.</summary>
    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id)
    {
        var result = await _cart.RemoveItemAsync(CurrentUserId, id);
        return ToResponse(result);
    }

    /// <summary>Clear all items from the cart.</summary>
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var result = await _cart.ClearCartAsync(CurrentUserId);
        return ToResponse(result);
    }
}
