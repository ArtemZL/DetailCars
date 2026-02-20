namespace ReactApp2.Server.Models.DTO
{
    public class CreateCarRequest
    {
        public string Brand { get; set; }
        public string Model { get; set; }
        public string? LicensePlate { get; set; }
        public int VehicleCategoryId { get; set; }
    }

    public class UserCarResponse
    {
        public int Id { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string? LicensePlate { get; set; }
        public string CategoryName { get; set; }

        public int VehicleCategoryId { get; set; }
    }
}
