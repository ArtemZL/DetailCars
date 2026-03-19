namespace ReactApp2.Server.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int DurationInMinutes { get; set; } = 60;
    }
}
