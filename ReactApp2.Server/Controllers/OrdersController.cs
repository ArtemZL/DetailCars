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
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        private readonly GeminiVisionService _geminiService;
        private readonly IWebHostEnvironment _env;

        public OrdersController(
            AppDbContext context,
            UserManager<User> userManager,
            GeminiVisionService geminiService, 
            IWebHostEnvironment env)           
        {
            _context = context;
            _userManager = userManager;
            _geminiService = geminiService;
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var car = await _context.UserCars
                .Include(c => c.VehicleCategory)
                .FirstOrDefaultAsync(c => c.Id == request.UserCarId && c.UserId == user.Id);

            if (car == null) return BadRequest("Обране авто не знайдено у вашому гаражі.");

            var services = await _context.Services
                .Where(s => request.ServiceIds.Contains(s.Id))
                .ToListAsync();

            if (!services.Any()) return BadRequest("Послуги не обрано.");

            decimal totalPrice = 0;
            var orderServices = new List<OrderService>();

            foreach (var svc in services)
            {
                decimal finalPrice = svc.BasePrice * (decimal)car.VehicleCategory.PriceMultiplier;
                totalPrice += finalPrice;

                orderServices.Add(new OrderService
                {
                    ServiceId = svc.Id,
                    Price = finalPrice
                });
            }

            decimal aiExtraPrice = 0;
            AiEvaluationResult? aiResult = null;

            if (!string.IsNullOrEmpty(request.ProblemPhotoUrl))
            {
                var webRootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
                var relativePath = request.ProblemPhotoUrl.TrimStart('/');
                var physicalImagePath = Path.Combine(webRootPath, relativePath);

                if (System.IO.File.Exists(physicalImagePath))
                {
                    try
                    {
                        aiResult = await _geminiService.EvaluateImageAsync(physicalImagePath, request.UserComments);

                        aiExtraPrice = aiResult.EstimatedExtraPrice;
                        totalPrice += aiExtraPrice;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Помилка ШІ: {ex.Message}");
                    }
                }
            }

            var order = new Models.Order
            {
                UserId = user.Id,
                UserCarId = car.Id,
                UserComments = request.UserComments,
                ProblemPhotoUrl = request.ProblemPhotoUrl,
                TotalPrice = totalPrice, 
                OrderServices = orderServices,

                AiProblemType = aiResult?.ProblemType,
                AiSeverity = aiResult?.Severity,
                AiRecommendedAddon = aiResult?.RecommendedAddon,
                AiExtraPrice = aiExtraPrice,
                AiManagerExplanation = aiResult?.AiManagerExplanation
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Замовлення успішно створено!", orderId = order.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.UserCar)
                .Include(o => o.OrderServices)
                    .ThenInclude(os => os.Service)
                .Where(o => o.UserId == user.Id)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    CarInfo = o.UserCar.Brand + " " + o.UserCar.Model,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status.ToString(),
                    CreatedAt = o.CreatedAt,
                    UserComments = o.UserComments,
                    ServiceNames = o.OrderServices.Select(os => os.Service.Name).ToList(),

                    AiExtraPrice = o.AiExtraPrice,
                    AiRecommendedAddon = o.AiRecommendedAddon,
                    AiProblemType = o.AiProblemType
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}