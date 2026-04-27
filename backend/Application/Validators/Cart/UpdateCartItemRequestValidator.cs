using FluentValidation;
using OnlineShop.Application.DTOs.Cart;

namespace OnlineShop.Application.Validators.Cart;

public class UpdateCartItemRequestValidator : AbstractValidator<UpdateCartItemRequest>
{
    public UpdateCartItemRequestValidator()
    {
        RuleFor(x => x.Quantity)
            .GreaterThan(0);
    }
}
