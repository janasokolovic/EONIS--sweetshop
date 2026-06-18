using FluentValidation;
using SweetShop.Application.DTOs.Auth;

namespace SweetShop.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email je obavezan.")
            .EmailAddress().WithMessage("Email nije validan.")
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Lozinka je obavezna.")
            .MinimumLength(8).WithMessage("Lozinka mora imati najmanje 8 karaktera.")
            .MaximumLength(100)
            .Matches(@"[A-Z]").WithMessage("Lozinka mora sadržati bar jedno veliko slovo.")
            .Matches(@"[a-z]").WithMessage("Lozinka mora sadržati bar jedno malo slovo.")
            .Matches(@"\d").WithMessage("Lozinka mora sadržati bar jedan broj.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ime je obavezno.")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Prezime je obavezno.")
            .MaximumLength(100);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20)
            .Matches(@"^[\d\s\+\-\(\)]+$").When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Broj telefona nije validan.");
    }
}