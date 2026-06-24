using SweetShop.Application.DTOs.Auth;

namespace SweetShop.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<UserDto> GetCurrentUserAsync(int userId);
    Task ForgotPasswordAsync(string email, string frontendBaseUrl);
    Task ResetPasswordAsync(string token, string newPassword);
}