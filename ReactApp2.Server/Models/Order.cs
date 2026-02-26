using System.ComponentModel.DataAnnotations.Schema;
using ReactApp2.Server.Enums;

namespace ReactApp2.Server.Models
{
    public class Order 
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int UserCarId { get; set; }
        public UserCar UserCar { get; set; }

        public string? ProblemPhotoUrl { get; set; }
        public string? UserComments { get; set; }

        public decimal TotalPrice { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? AiProblemType { get; set; }
        public int? AiSeverity { get; set; }
        public string? AiRecommendedAddon { get; set; }
        public decimal AiExtraPrice { get; set; } // Додаткова ціна від ШІ
        public string? AiManagerExplanation { get; set; }

        public List<OrderService> OrderServices { get; set; } = new();
    }
}
