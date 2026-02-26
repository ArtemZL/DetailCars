namespace ReactApp2.Server.Models.DTO
{
    public class AiEvaluationResult
    {
        public string ProblemType { get; set; }
        public int Severity { get; set; }
        public string RecommendedAddon { get; set; }
        public int EstimatedExtraTimeMinutes { get; set; }
        public decimal EstimatedExtraPrice { get; set; }
        public string AiManagerExplanation { get; set; }
    }
}
