using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SweetShop.API.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize(Roles = "Admin")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;

        
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

        public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

       
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "products")
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Niste odabrali fajl." });

           
            if (file.Length > MaxFileSize)
                return BadRequest(new { message = $"Fajl je prevelik. Maksimalna veličina je {MaxFileSize / 1024 / 1024} MB." });

           
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { message = $"Tip fajla nije dozvoljen. Dozvoljeni tipovi: {string.Join(", ", AllowedExtensions)}" });

           
            if (folder != "products" && folder != "categories")
                return BadRequest(new { message = "Neispravan folder. Dozvoljene vrednosti: products, categories." });

            try
            {
                
                var uploadsRoot = Path.Combine(_environment.WebRootPath, "uploads", folder);
                Directory.CreateDirectory(uploadsRoot); 

               
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsRoot, uniqueFileName);

             
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

             
                var relativeUrl = $"/uploads/{folder}/{uniqueFileName}";

                _logger.LogInformation("Image uploaded successfully: {Url}", relativeUrl);

                return Ok(new { url = relativeUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, new { message = "Greška pri uploadu fajla." });
            }
        }
    }
}