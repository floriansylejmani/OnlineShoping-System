using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Auth;

namespace OnlineShop.Application.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
}
