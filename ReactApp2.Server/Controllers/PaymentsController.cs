using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Data;
using ReactApp2.Server.Enums; // Переконайтесь, що тут ваш OrderStatus

namespace ReactApp2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Ініціалізація оплати (викликається з Checkout)
        [HttpPost("create-mock-payment")]
        public async Task<IActionResult> CreateMockPayment([FromBody] int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound("Замовлення не знайдено");

            // Формуємо URL на нашу фейкову сторінку оплати в React
            // Передаємо orderId та суму (наприклад, хардкод або з order.TotalPrice)
            var paymentUrl = $"/fake-payment?orderId={orderId}&amount={(order.TotalPrice != 0 ? order.TotalPrice : 1500)}";

            return Ok(new { url = paymentUrl });
        }

        // 2. Симуляція вебхуку (викликається після "успішної" оплати на фейк-сторінці)
        [HttpPost("confirm-mock-payment/{orderId}")]
        public async Task<IActionResult> ConfirmPayment(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound();

            // Було: order.Status = OrderStatus.Completed;
            order.Status = OrderStatus.Paid; // <--- ЗМІНЮЄМО НА "ОПЛАЧЕНО"
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Оплату успішно підтверджено" });
        }
    }
}