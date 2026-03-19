using ReactApp2.Server.Models;

namespace ReactApp2.Server.Data
{
    public class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.VehicleCategories.Any())
            {
                return;   
            }

            var categories = new VehicleCategory[]
            {
                new VehicleCategory { Name = "Седан / Хетчбек / Купе", PriceMultiplier = 1.0 },
                new VehicleCategory { Name = "Кросовер / Універсал", PriceMultiplier = 1.2 },
                new VehicleCategory { Name = "Позашляховик / Мінівен", PriceMultiplier = 1.4 },
                new VehicleCategory { Name = "Мікроавтобус / Бус", PriceMultiplier = 1.6 }
            };

            context.VehicleCategories.AddRange(categories);
            context.SaveChanges();

            var services = new Service[]
            {
                new Service { Name = "Експрес мийка", BasePrice = 150, Description = "Збив бруду, активна піна, змив, сушка", DurationInMinutes = 30},
                new Service { Name = "Комплексна мийка", BasePrice = 350, Description = "Мийка кузова + прибирання салону + віск", DurationInMinutes = 60},
                new Service { Name = "Хімчистка салону", BasePrice = 2500, Description = "Повна хімчистка сидінь, стелі та підлоги", DurationInMinutes = 240 },
                new Service { Name = "Полірування кузова", BasePrice = 4000, Description = "Відновлювальне полірування, видалення подряпин", DurationInMinutes = 300},
                new Service { Name = "Мийка двигуна", BasePrice = 300, Description = "Делікатна мийка парою", DurationInMinutes = 45},
                new Service { Name = "Антидощ", BasePrice = 500, Description = "Покриття скла водовідштовхуючим засобом", DurationInMinutes = 30}
            };

            context.Services.AddRange(services);
            context.SaveChanges();
        }
    }
}
