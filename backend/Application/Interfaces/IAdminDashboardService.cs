using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Admin;

namespace OnlineShop.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<Result<AdminDashboardDto>> GetDashboardAsync();
}
