using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    // ":" means derived from class IdentityDbContext (from EF)
    public class StoreContext : IdentityDbContext<User>
    {
        // constructor to pass in options (e.g. DB connection string)
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        // For each entity, create a DbSet (table)
        public DbSet<Product> Products { get; set; } // "Products" is table's name

        public DbSet<Basket> Baskets { get; set; } // Baskets table

        public DbSet<Order> Orders { get; set; } // Orders table

        // alternative way to seed data into db: override OnModelCreating method
        protected override void OnModelCreating(ModelBuilder builder)
        {
            // from IdentityDbContext class
            base.OnModelCreating(builder);
            // add 2 roles into db when creating migrations
            builder.Entity<IdentityRole>()
                .HasData(
                    new IdentityRole { Name = "Member", NormalizedName = "MEMBER" },
                    new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" }
                );
        }
    }
}