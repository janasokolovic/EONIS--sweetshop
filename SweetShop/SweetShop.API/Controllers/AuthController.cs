using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SweetShop.Application.DTOs.Auth;
using SweetShop.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace SweetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUser;
    private readonly IConfiguration _config;

    public AuthController(IAuthService authService, ICurrentUserService currentUser, IConfiguration config)
    {
        _authService = authService;
        _currentUser = currentUser;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }

   
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

  
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:4200";
        await _authService.ForgotPasswordAsync(dto.Email, frontendBaseUrl);
        return Ok(new { message = "Ako email postoji, poslaćemo vam link za resetovanje." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
        return Ok(new { message = "Lozinka je uspešno promenjena." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        if (!_currentUser.UserId.HasValue)
            return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(_currentUser.UserId.Value);
        return Ok(user);
    }
}