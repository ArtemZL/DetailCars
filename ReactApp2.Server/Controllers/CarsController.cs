using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Data; 
using ReactApp2.Server.Models.DTO;
using ReactApp2.Server.Models;

namespace ReactApp2.Server.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class CarsController : ControllerBase
    {
        private readonly AppDbContext _context; 
        private readonly UserManager<User> _userManager;

        public CarsController(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyCars()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var cars = await _context.UserCars 
                .Include(c => c.VehicleCategory) 
                .Where(c => c.UserId == user.Id)
                .Select(c => new UserCarResponse
                {
                    Id = c.Id,
                    Brand = c.Brand,
                    Model = c.Model,
                    LicensePlate = c.LicensePlate,
                    CategoryName = c.VehicleCategory.Name
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpPost]
        public async Task<IActionResult> AddCar([FromBody] CreateCarRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var newCar = new UserCar
            {
                UserId = user.Id,
                Brand = request.Brand,
                Model = request.Model,
                LicensePlate = request.LicensePlate,
                VehicleCategoryId = request.VehicleCategoryId
            };

            _context.UserCars.Add(newCar); 
            await _context.SaveChangesAsync();

            return Ok(new { message = "Машину успішно додано у ваш гараж!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCar(int id, [FromBody] CreateCarRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var car = await _context.UserCars.FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);
            if (car == null) return NotFound("Авто не знайдено.");

            car.Brand = request.Brand;
            car.Model = request.Model;
            car.LicensePlate = request.LicensePlate;
            car.VehicleCategoryId = request.VehicleCategoryId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Дані авто оновлено!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var car = await _context.UserCars.FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);
            if (car == null) return NotFound("Авто не знайдено.");

            _context.UserCars.Remove(car);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Авто видалено!" });
        }
    }
}
