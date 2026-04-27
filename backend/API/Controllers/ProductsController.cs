using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs.Products;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
public class ProductsController : BaseApiController
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    /// <summary>Browse products with optional search, category, and price filters.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductQueryRequest query)
    {
        var result = await _products.GetAllAsync(query);
        return ToResponse(result);
    }

    /// <summary>Get a single product by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _products.GetByIdAsync(id);
        return ToResponse(result);
    }

    /// <summary>Create a new product. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var result = await _products.CreateAsync(request);
        return ToResponse(result);
    }

    /// <summary>Update an existing product. Admin only.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var result = await _products.UpdateAsync(id, request);
        return ToResponse(result);
    }

    /// <summary>Soft-delete a product (sets IsActive = false). Admin only.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _products.DeleteAsync(id);
        return ToResponse(result);
    }
}
