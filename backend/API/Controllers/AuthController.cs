using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OnlineShop.Application.DTOs.Auth;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Register a new customer account.</summary>
    [HttpPost("register")]
    [EnableRateLimiting("Auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _auth.RegisterAsync(request);
        return ToResponse(result);
    }

    /// <summary>Login and receive a JWT token.</summary>
    [HttpPost("login")]
    [EnableRateLimiting("Auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        return ToResponse(result);
    }
}
