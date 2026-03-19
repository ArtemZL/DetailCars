namespace ReactApp2.Server.Models.DTO
{
    public class CreateOrderRequest
    {
        public int UserCarId { get; set; } // Яку машину вибрав клієнт
        public List<int> ServiceIds { get; set; } // Список обраних послуг (зробимо списком на майбутнє, раптом клієнт захоче мийку + хімчистку одразу)
        public string? UserComments { get; set; } // Побажання клієнта
        public string? ProblemPhotoUrl { get; set; }
        public DateTime ScheduledStartTime { get; set; }
    }

    public class OrderResponse
    {
        public int Id { get; set; }
        public string CarInfo { get; set; } 
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } 
        public DateTime CreatedAt { get; set; }
        public string? UserComments { get; set; }
        public List<string> ServiceNames { get; set; }
        public decimal? AiExtraPrice { get; set; } // Щоб показати, скільки додав ШІ
        public string? AiRecommendedAddon { get; set; } // Назва доданої послуги
        public string? AiProblemType { get; set; } // Тип проблеми (наприклад, "Пляма")
        public DateTime ScheduledStartTime { get; set; }
    }
}
