using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ReactApp2.Server.Models;
using ReactApp2.Server.Models.DTO; 
using Microsoft.AspNetCore.Authorization;
using ReactApp2.Server.Services;
using Microsoft.Extensions.Configuration;

namespace ReactApp2.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, IEmailService emailService, IConfiguration configuration)
        {
            _userManager = userManager;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("register-client")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientRequest request)
        {
            var user = new User
            {
                UserName = request.Email, 
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                return Ok(new { message = "Реєстрація успішна!" });
            }

           
            return BadRequest(result.Errors);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return NotFound("Користувача не знайдено.");
            }

            return Ok(new UserProfileResponse
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber
            });
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded) return Ok(new { message = "Профіль успішно оновлено!" });
            return BadRequest("Помилка при оновленні профілю.");
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (result.Succeeded) return Ok(new { message = "Пароль успішно змінено!" });

            return BadRequest("Неправильний поточний пароль або новий пароль занадто простий.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Повертаємо Ok, щоб запобігти визначенню хакерами, чи існує email в базі
                return Ok(new { message = "Якщо такий email існує, ми надіслали інструкції." });
            }

            // Генеруємо токен для скидання
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            var clientBaseUrl = _configuration["ClientApp:BaseUrl"] ?? "https://localhost:53151";
var resetLink = $"{clientBaseUrl}/reset-password?email={Uri.EscapeDataString(request.Email)}&token={Uri.EscapeDataString(token)}";

            // Відправляємо лист
            var subject = "Скидання паролю на DetailCars";
            var body = $"<p>Для скидання паролю перейдіть за <a href='{resetLink}'>цим посиланням</a>.</p>";
            
            await _emailService.SendEmailAsync(user.Email, subject, body);

            return Ok(new { message = "Якщо такий email існує, ми надіслали інструкції." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null) return BadRequest("Помилка скидання пароля.");

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Пароль успішно змінено!" });
            }

            return BadRequest(result.Errors);
        }
    }
}