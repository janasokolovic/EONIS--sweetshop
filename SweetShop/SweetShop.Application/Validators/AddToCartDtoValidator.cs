using FluentValidation;
using SweetShop.Application.DTOs.Cart;

namespace SweetShop.Application.Validators;

public class AddToCartDtoValidator : AbstractValidator<AddToCartDto>
{
    public AddToCartDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ID proizvoda nije validan.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Količina mora biti veća od 0.")
            .LessThanOrEqualTo(100).WithMessage("Količina ne može biti veća od 100.");
    }
}