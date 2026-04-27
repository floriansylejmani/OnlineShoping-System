using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Categories;

namespace OnlineShop.Application.Interfaces;

public interface ICategoryService
{
    Task<Result<IReadOnlyList<CategoryDto>>> GetAllAsync();
    Task<Result<CategoryDto>> GetByIdAsync(Guid id);
    Task<Result<CategoryDto>> CreateAsync(CreateCategoryRequest request);
    Task<Result<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryRequest request);
    Task<Result> DeleteAsync(Guid id);
}
