using FluentValidation;
using OnlineShop.Application.DTOs.Payments;

namespace OnlineShop.Application.Validators.Payments;

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty();
    }
}
