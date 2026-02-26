using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactApp2.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAiFieldsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AiExtraPrice",
                table: "Orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "AiManagerExplanation",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiProblemType",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiRecommendedAddon",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiSeverity",
                table: "Orders",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiExtraPrice",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AiManagerExplanation",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AiProblemType",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AiRecommendedAddon",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AiSeverity",
                table: "Orders");
        }
    }
}
