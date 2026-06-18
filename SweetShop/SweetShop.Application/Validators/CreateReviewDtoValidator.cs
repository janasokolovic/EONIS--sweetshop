using FluentValidation;
using SweetShop.Application.DTOs.Reviews;

namespace SweetShop.Application.Validators;

public class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ID proizvoda nije validan.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Ocena mora biti između 1 i 5.");

        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Komentar je obavezan.")
            .MinimumLength(5).WithMessage("Komentar mora imati najmanje 5 karaktera.")
            .MaximumLength(2000);
    }
}