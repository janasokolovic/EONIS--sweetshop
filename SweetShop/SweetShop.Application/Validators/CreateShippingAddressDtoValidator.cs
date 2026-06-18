using FluentValidation;
using SweetShop.Application.DTOs.ShippingAddresses;

namespace SweetShop.Application.Validators;

public class CreateShippingAddressDtoValidator : AbstractValidator<CreateShippingAddressDto>
{
    public CreateShippingAddressDtoValidator()
    {
        RuleFor(x => x.RecipientName)
            .NotEmpty().WithMessage("Ime primaoca je obavezno.")
            .MaximumLength(200);

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Ulica je obavezna.")
            .MaximumLength(200);

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("Grad je obavezan.")
            .MaximumLength(100);

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Poštanski broj je obavezan.")
            .MaximumLength(20);

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Država je obavezna.")
            .MaximumLength(100);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20);
    }
}