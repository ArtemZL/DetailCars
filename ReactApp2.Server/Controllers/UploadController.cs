using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReactApp2.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        // IWebHostEnvironment дозволяє нам дізнатися, де знаходиться папка wwwroot
        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не обрано.");

            // 1. Безпечне отримання шляху до wwwroot (не впаде, якщо папки немає)
            var webRootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 2. Безпечне отримання імені файлу (відкидає можливі сторонні шляхи)
            var safeFileName = Path.GetFileName(file.FileName);

            // Унікальне ім'я для файлу
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + safeFileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Зберігаємо файл фізично на сервер
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Повертаємо клієнту шлях до файлу
            var url = $"/uploads/{uniqueFileName}";
            return Ok(new { url });
        }
    }
}
