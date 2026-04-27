using FluentValidation;
using OnlineShop.Application.DTOs.Categories;

namespace OnlineShop.Application.Validators.Categories;

public class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
    }
}
