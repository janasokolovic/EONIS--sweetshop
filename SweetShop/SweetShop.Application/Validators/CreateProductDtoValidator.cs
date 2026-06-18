using FluentValidation;
using SweetShop.Application.DTOs.Products;

namespace SweetShop.Application.Validators;

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Naziv proizvoda je obavezan.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Opis proizvoda je obavezan.")
            .MaximumLength(2000);

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Cena mora biti veća od 0.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Količina ne može biti negativna.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Kategorija mora biti izabrana.");

        RuleForEach(x => x.Images).ChildRules(image =>
        {
            image.RuleFor(i => i.ImageUrl)
                .NotEmpty().WithMessage("URL slike je obavezan.")
                .MaximumLength(500);
            image.RuleFor(i => i.DisplayOrder)
                .GreaterThanOrEqualTo(0);
        });
    }
}