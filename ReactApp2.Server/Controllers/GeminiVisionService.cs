using ReactApp2.Server.Models.DTO;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Hosting;

namespace ReactApp2.Server.Controllers
{
    public class GeminiVisionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiVisionService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"];
        }

        public async Task<AiEvaluationResult> EvaluateImageAsync(string physicalImagePath, string userComment)
        {
            byte[] imageBytes = await File.ReadAllBytesAsync(physicalImagePath);
            string base64Image = Convert.ToBase64String(imageBytes);

            string extension = Path.GetExtension(physicalImagePath).ToLower();
            string mimeType = extension == ".png" ? "image/png" :
                              extension == ".webp" ? "image/webp" : "image/jpeg";

            // Перевіряємо, чи є коментар, і формуємо безпечний рядок
            string safeComment = string.IsNullOrWhiteSpace(userComment)
                ? "Клієнт не залишив коментаря. Уважно оглянь фото на власний розсуд."
                : userComment;

            var prompt = $@"Ти — досвідчений майстер-оцінювач у преміум-студії детейлінгу. 
Твоє завдання — проаналізувати фотографію автомобіля (салону або кузова), щоб знайти забруднення, плями, подряпини чи інші дефекти, які потребують додаткових платних послуг.

Коментар клієнта: {safeComment}

Правила оцінки:
1. Якщо на фото все виглядає чистим або немає очевидних проблем, які вимагають додаткової оплати, встанови severity = 0 та estimatedExtraPrice = 0.
2. Якщо проблема є (бруд, шерсть, пляма, подряпина тощо), визначи її тип, складність (від 1 до 5) та запропонуй додаткову послугу.
3. Оціни адекватну ринкову вартість цієї додаткової роботи у гривнях (UAH) і вкажи ЛИШЕ ЧИСЛО (наприклад: 200, 500, 1500).

Поверни відповідь СУВОРО у форматі JSON з такими ключами:
- ""problemType"": (рядок: ""Stain"", ""Scratch"", ""Dirt"", ""Hair"", ""Odor"", ""None"" або ""Other"")
- ""severity"": (число від 0 до 5, де 0 - чисто, 5 - дуже серйозна проблема)
- ""recommendedAddon"": (рядок: коротка назва послуги, наприклад, ""Хімчистка сидіння"", ""Локальне полірування"", або ""Не потрібно"", якщо проблем немає)
- ""estimatedExtraTimeMinutes"": (число: додатковий час у хвилинах, 0 якщо не треба)
- ""estimatedExtraPrice"": (число: вартість послуги в гривнях, 0 якщо не треба)
- ""aiManagerExplanation"": (рядок: коротке логічне пояснення для адміністратора мийки: що саме ти побачив і чому призначив таку ціну і час).";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = mimeType,
                                    data = base64Image
                                }
                            }
                        }
                    }
                },
                //  Gemini гарантовано повернути чистий JSON без зайвого тексту
                generationConfig = new
                {
                    response_mime_type = "application/json"
                }
            };

            string jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={_apiKey}";

            var response = await _httpClient.PostAsync(url, content);

            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            using var jsonDocument = JsonDocument.Parse(responseString);

            var aiMessageContent = jsonDocument.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            var result = JsonSerializer.Deserialize<AiEvaluationResult>(aiMessageContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result;
        }
    }
}
