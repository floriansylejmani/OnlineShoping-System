using FluentValidation;
using OnlineShop.Application.DTOs.Categories;

namespace OnlineShop.Application.Validators.Categories;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
    }
}
