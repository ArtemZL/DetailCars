namespace ReactApp2.Server.Models.DTO
{
    public class CreateOrderRequest
    {
        public int UserCarId { get; set; } // Яку машину вибрав клієнт
        public List<int> ServiceIds { get; set; } // Список обраних послуг (зробимо списком на майбутнє, раптом клієнт захоче мийку + хімчистку одразу)
        public string? UserComments { get; set; } // Побажання клієнта
    }
}
