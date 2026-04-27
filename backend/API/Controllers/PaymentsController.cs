using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs.Payments;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments) => _payments = payments;

    /// <summary>Pay for an order. Sets payment status to Paid and order status to Processing.</summary>
    [HttpPost]
    public async Task<IActionResult> Process([FromBody] CreatePaymentRequest request)
    {
        var result = await _payments.ProcessAsync(CurrentUserId, request);
        return ToResponse(result);
    }
}
