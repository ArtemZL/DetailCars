using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp2.Server.Models
{
    public class UserCar
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int VehicleCategoryId { get; set; } 
        public VehicleCategory VehicleCategory { get; set; }

        public string Brand { get; set; } 
        public string Model { get; set; } 
        public string? LicensePlate { get; set; }
    }
}
