using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Products;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context) => _context = context;

    public async Task<Result<PagedResult<ProductDto>>> GetAllAsync(ProductQueryRequest query)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var q = _context.Products
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        if (query.CategoryId.HasValue)
            q = q.Where(p => p.CategoryId == query.CategoryId.Value);

        if (query.MinPrice.HasValue)
            q = q.Where(p => p.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            q = q.Where(p => p.Price <= query.MaxPrice.Value);

        q = ApplySorting(q, query.SortBy, query.SortDirection);

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Result<PagedResult<ProductDto>>.Success(
            new PagedResult<ProductDto>(items, total, page, pageSize));
    }

    public async Task<Result<ProductDto>> GetByIdAsync(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
            return Result<ProductDto>.Failure("Product not found.");

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result<ProductDto>> CreateAsync(CreateProductRequest request)
    {
        if (!await _context.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return Result<ProductDto>.Failure("Category not found.");

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl,
            CategoryId = request.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
            return Result<ProductDto>.Failure("Product not found.");

        if (!await _context.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return Result<ProductDto>.Failure("Category not found.");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.ImageUrl = request.ImageUrl;
        product.CategoryId = request.CategoryId;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return Result.Failure("Product not found.");

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsActive = p.IsActive,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        CreatedAt = p.CreatedAt
    };

    private static IQueryable<Product> ApplySorting(
        IQueryable<Product> query,
        string? sortBy,
        string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return sortBy?.ToLowerInvariant() switch
        {
            "price" => descending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "newest" or "createdat" => descending ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt),
            "stock" => descending ? query.OrderByDescending(p => p.StockQuantity) : query.OrderBy(p => p.StockQuantity),
            _ => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name)
        };
    }
}
