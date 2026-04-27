using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Admin;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Enums;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private const int LowStockThreshold = 10;
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context) => _context = context;

    public async Task<Result<AdminDashboardDto>> GetDashboardAsync()
    {
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalCategories = await _context.Categories.CountAsync();
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Payments
            .Where(payment => payment.Status == PaymentStatus.Completed)
            .SumAsync(payment => (decimal?)payment.Amount) ?? 0;
        var pendingOrdersCount = await _context.Orders.CountAsync(order => order.Status == OrderStatus.Pending);
        var lowStockProductsCount = await _context.Products
            .CountAsync(product => product.IsActive && product.StockQuantity <= LowStockThreshold);

        var recentOrders = await _context.Orders
            .Include(order => order.User)
            .Include(order => order.Items)
            .OrderByDescending(order => order.CreatedAt)
            .Take(6)
            .Select(order => new AdminRecentOrderDto
            {
                Id = order.Id,
                CustomerEmail = order.User.Email,
                Status = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                ItemCount = order.Items.Sum(item => item.Quantity),
                CreatedAt = order.CreatedAt
            })
            .ToListAsync();

        var lowStockProducts = await _context.Products
            .Include(product => product.Category)
            .Where(product => product.IsActive && product.StockQuantity <= LowStockThreshold)
            .OrderBy(product => product.StockQuantity)
            .ThenBy(product => product.Name)
            .Take(6)
            .Select(product => new AdminLowStockProductDto
            {
                Id = product.Id,
                Name = product.Name,
                CategoryName = product.Category.Name,
                StockQuantity = product.StockQuantity
            })
            .ToListAsync();

        var bestSellingProducts = await _context.OrderItems
            .Include(item => item.Product)
            .GroupBy(item => new { item.ProductId, item.Product.Name })
            .Select(group => new AdminBestSellingProductDto
            {
                ProductId = group.Key.ProductId,
                ProductName = group.Key.Name,
                QuantitySold = group.Sum(item => item.Quantity),
                Revenue = group.Sum(item => item.UnitPrice * item.Quantity)
            })
            .OrderByDescending(product => product.QuantitySold)
            .Take(5)
            .ToListAsync();

        return Result<AdminDashboardDto>.Success(new AdminDashboardDto
        {
            TotalProducts = totalProducts,
            TotalCategories = totalCategories,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            PendingOrdersCount = pendingOrdersCount,
            LowStockProductsCount = lowStockProductsCount,
            RecentOrders = recentOrders,
            LowStockProducts = lowStockProducts,
            BestSellingProducts = bestSellingProducts
        });
    }
}
