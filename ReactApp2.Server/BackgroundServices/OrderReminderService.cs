using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Data;
using ReactApp2.Server.Enums;
using ReactApp2.Server.Services;

namespace ReactApp2.Server.BackgroundServices
{
    public class OrderReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public OrderReminderService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var now = DateTime.Now;
                var remindUntil = now.AddHours(1);

                var ordersToRemind = await context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderServices)
                    .ThenInclude(os => os.Service)
                    .Where(o =>
                        o.ReminderSentAt == null &&
                        (o.Status == OrderStatus.Pending || o.Status == OrderStatus.InProgress) &&
                        o.ScheduledStartTime > now &&
                        o.ScheduledStartTime <= remindUntil)
                    .ToListAsync(stoppingToken);

                foreach (var order in ordersToRemind)
                {
                    if (string.IsNullOrWhiteSpace(order.User?.Email))
                    {
                        order.ReminderSentAt = now;
                        continue;
                    }

                    var services = order.OrderServices
                        .Select(os => os.Service?.Name)
                        .Where(name => !string.IsNullOrWhiteSpace(name))
                        .Distinct()
                        .ToList();

                    var servicesText = services.Count > 0 ? string.Join(", ", services) : "обрана послуга";
                    var timeText = order.ScheduledStartTime.ToString("dd.MM.yyyy HH:mm");

                    var subject = "Нагадування про запис на послугу";
                    var body = $"<p>Нагадуємо: ви записані на <strong>{servicesText}</strong> о <strong>{timeText}</strong>.</p>";

                    await emailService.SendEmailAsync(order.User.Email, subject, body);
                    order.ReminderSentAt = now;
                }

                if (ordersToRemind.Count > 0)
                {
                    await context.SaveChangesAsync(stoppingToken);
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}