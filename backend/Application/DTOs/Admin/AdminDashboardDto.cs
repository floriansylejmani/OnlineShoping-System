namespace OnlineShop.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalProducts { get; set; }
    public int TotalCategories { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOrdersCount { get; set; }
    public int LowStockProductsCount { get; set; }
    public IReadOnlyList<AdminRecentOrderDto> RecentOrders { get; set; } = [];
    public IReadOnlyList<AdminLowStockProductDto> LowStockProducts { get; set; } = [];
    public IReadOnlyList<AdminBestSellingProductDto> BestSellingProducts { get; set; } = [];
}

public class AdminRecentOrderDto
{
    public Guid Id { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminLowStockProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}

public class AdminBestSellingProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}
