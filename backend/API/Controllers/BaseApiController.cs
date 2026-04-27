using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.Common;

namespace OnlineShop.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    protected IActionResult ToResponse<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result.Data);

        return IsNotFound(result.Errors)
            ? NotFound(new { errors = result.Errors })
            : BadRequest(new { errors = result.Errors });
    }

    protected IActionResult ToResponse(Result result)
    {
        if (result.IsSuccess)
            return NoContent();

        return IsNotFound(result.Errors)
            ? NotFound(new { errors = result.Errors })
            : BadRequest(new { errors = result.Errors });
    }

    private static bool IsNotFound(IReadOnlyList<string> errors) =>
        errors.Any(e => e.Contains("not found", StringComparison.OrdinalIgnoreCase));
}
