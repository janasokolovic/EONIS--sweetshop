using SweetShop.Domain.Entities;

namespace SweetShop.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user, out DateTime expiresAt);
}