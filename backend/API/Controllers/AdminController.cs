using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminDashboardService _dashboard;

    public AdminController(IAdminDashboardService dashboard) => _dashboard = dashboard;

    /// <summary>Get e-commerce dashboard metrics for administrators.</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _dashboard.GetDashboardAsync();
        return ToResponse(result);
    }
}
