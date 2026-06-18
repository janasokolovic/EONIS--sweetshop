using FluentValidation;
using SweetShop.Application.DTOs.Orders;

namespace SweetShop.Application.Validators;

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.ShippingAddressId)
            .GreaterThan(0).WithMessage("Morate izabrati adresu isporuke.");
    }
}