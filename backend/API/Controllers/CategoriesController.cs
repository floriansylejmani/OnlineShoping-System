using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs.Categories;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.API.Controllers;

[Route("api/[controller]")]
public class CategoriesController : BaseApiController
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories) => _categories = categories;

    /// <summary>Get all categories with active product counts.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _categories.GetAllAsync();
        return ToResponse(result);
    }

    /// <summary>Create a new category. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var result = await _categories.CreateAsync(request);
        return ToResponse(result);
    }

    /// <summary>Update a category name. Admin only.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var result = await _categories.UpdateAsync(id, request);
        return ToResponse(result);
    }

    /// <summary>Delete a category. Admin only. Fails if active products exist.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _categories.DeleteAsync(id);
        return ToResponse(result);
    }
}
