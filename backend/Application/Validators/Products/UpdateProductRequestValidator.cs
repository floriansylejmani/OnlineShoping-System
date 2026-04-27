using FluentValidation;
using OnlineShop.Application.DTOs.Products;

namespace OnlineShop.Application.Validators.Products;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .MaximumLength(2000);

        RuleFor(x => x.Price)
            .GreaterThan(0);

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500);

        RuleFor(x => x.CategoryId)
            .NotEmpty();
    }
}
