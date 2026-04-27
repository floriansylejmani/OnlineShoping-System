using OnlineShop.Application.Common;
using OnlineShop.Application.DTOs.Products;

namespace OnlineShop.Application.Interfaces;

public interface IProductService
{
    Task<Result<PagedResult<ProductDto>>> GetAllAsync(ProductQueryRequest query);
    Task<Result<ProductDto>> GetByIdAsync(Guid id);
    Task<Result<ProductDto>> CreateAsync(CreateProductRequest request);
    Task<Result<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request);
    Task<Result> DeleteAsync(Guid id);
}
