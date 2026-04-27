using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Categories;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Persistence;

namespace OnlineShop.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<CategoryDto>>> GetAllAsync()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync();

        return Result<IReadOnlyList<CategoryDto>>.Success(categories);
    }

    public async Task<Result<CategoryDto>> GetByIdAsync(Guid id)
    {
        var dto = await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .FirstOrDefaultAsync(c => c.Id == id);

        if (dto is null)
            return Result<CategoryDto>.Failure("Category not found.");

        return Result<CategoryDto>.Success(dto);
    }

    public async Task<Result<CategoryDto>> CreateAsync(CreateCategoryRequest request)
    {
        if (await _context.Categories.AnyAsync(c => c.Name == request.Name))
            return Result<CategoryDto>.Failure("A category with this name already exists.");

        var category = new Category { Name = request.Name };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Result<CategoryDto>.Success(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ProductCount = 0
        });
    }

    public async Task<Result<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            return Result<CategoryDto>.Failure("Category not found.");

        if (await _context.Categories.AnyAsync(c => c.Name == request.Name && c.Id != id))
            return Result<CategoryDto>.Failure("A category with this name already exists.");

        category.Name = request.Name;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var productCount = await _context.Products.CountAsync(p => p.CategoryId == id && p.IsActive);

        return Result<CategoryDto>.Success(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ProductCount = productCount
        });
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            return Result.Failure("Category not found.");

        if (await _context.Products.AnyAsync(p => p.CategoryId == id && p.IsActive))
            return Result.Failure("Cannot delete a category that has active products.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Result.Success();
    }
}
