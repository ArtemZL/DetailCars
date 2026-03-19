using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Data;
using ReactApp2.Server.Enums;

namespace ReactApp2.Server.BackgroundServices
{
    public class OrderStatusUpdaterService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public OrderStatusUpdaterService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Цей цикл буде крутитися нескінченно, поки працює сервер
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    // Шукаємо замовлення, які ще не виконані, але їхній час вже вийшов
                    var ordersToComplete = await context.Orders
                        .Where(o => (o.Status == OrderStatus.Pending || o.Status == OrderStatus.InProgress)
                                 && o.ScheduledEndTime <= DateTime.Now)
                        .ToListAsync(stoppingToken);

                    if (ordersToComplete.Any())
                    {
                        foreach (var order in ordersToComplete)
                        {
                            order.Status = OrderStatus.Completed; 
                        }
                        await context.SaveChangesAsync(stoppingToken);
                        Console.WriteLine($"[Автоматизація] Автоматично завершено {ordersToComplete.Count} замовлень.");
                    }
                }

                // Чекаємо 1 хвилину перед наступною перевіркою
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
