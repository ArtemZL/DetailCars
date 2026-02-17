using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Models;

namespace ReactApp2.Server.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<VehicleCategory> VehicleCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<UserCar> UserCars { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderService> OrderServices { get; set; }
    }
}
