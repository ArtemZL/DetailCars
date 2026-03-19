using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactApp2.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeSchedulingToServicesAndOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DurationInMinutes",
                table: "Services",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledEndTime",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledStartTime",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationInMinutes",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ScheduledEndTime",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ScheduledStartTime",
                table: "Orders");
        }
    }
}
