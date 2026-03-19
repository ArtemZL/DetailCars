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

            int totalDurationMinutes = services.Sum(s => s.DurationInMinutes);

            int aiExtraTimeMinutes = aiResult?.EstimatedExtraTimeMinutes ?? 0;
            int finalDuration = totalDurationMinutes + aiExtraTimeMinutes;

            var order = new Models.Order
            {
                UserId = user.Id,
                UserCarId = car.Id,
                UserComments = request.UserComments,
                ProblemPhotoUrl = request.ProblemPhotoUrl,
                TotalPrice = totalPrice, 
                OrderServices = orderServices,

                ScheduledStartTime = request.ScheduledStartTime,
                ScheduledEndTime = request.ScheduledStartTime.AddMinutes(finalDuration),
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

        [HttpGet("available-slots")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAvailableSlots([FromQuery] string date, [FromQuery] int durationMinutes)
        {
            if (!DateTime.TryParse(date, out DateTime selectedDate))
            {
                return BadRequest("Неправильний формат дати.");
            }

            TimeSpan openTime = new TimeSpan(9, 0, 0);  
            TimeSpan closeTime = new TimeSpan(18, 0, 0); 
            int stepMinutes = 30; // Крок календаря 

            // 3. Дістаємо всі замовлення на обрану дату
            // (виключаємо ті, що скасовані, щоб їхній час знову став вільним)
            var existingOrders = await _context.Orders
                .Where(o => o.ScheduledStartTime.Date == selectedDate.Date
                         && o.Status != ReactApp2.Server.Enums.OrderStatus.Cancelled)
                .Select(o => new { o.ScheduledStartTime, o.ScheduledEndTime })
                .ToListAsync();

            var availableSlots = new List<string>();

            var currentSlot = selectedDate.Date.Add(openTime);
            var endOfDay = selectedDate.Date.Add(closeTime);

            // Шукаємо поки кінець нашої послуги не вилізе за час закриття
            while (currentSlot.AddMinutes(durationMinutes) <= endOfDay)
            {
                var proposedEndTime = currentSlot.AddMinutes(durationMinutes);

                // Перевіряємо, чи перетинається наш час із хоча б одним існуючим замовленням.
                // Перетин є, якщо наш початок раніше за чужий кінець, А наш кінець пізніше за чужий початок.
                bool isOverlapping = existingOrders.Any(o =>
                    currentSlot < o.ScheduledEndTime && proposedEndTime > o.ScheduledStartTime);

                // Якщо цей час вільний і він не в минулому (актуально для запису "на сьогодні")
                if (!isOverlapping && currentSlot > DateTime.Now)
                {
                    availableSlots.Add(currentSlot.ToString("HH:mm"));
                }

                currentSlot = currentSlot.AddMinutes(stepMinutes);
            }

            return Ok(availableSlots);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Шукаємо замовлення, яке належить саме цьому користувачу
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == user.Id);

            if (order == null) return NotFound("Замовлення не знайдено.");

            // Перевіряємо чи можна його скасувати (вже виконане або скасоване не чіпаємо)
            if (order.Status == ReactApp2.Server.Enums.OrderStatus.Completed ||
                order.Status == ReactApp2.Server.Enums.OrderStatus.Cancelled)
            {
                return BadRequest("Це замовлення вже не можна скасувати.");
            }

            order.Status = ReactApp2.Server.Enums.OrderStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Замовлення успішно скасовано." });
        }
    }
}