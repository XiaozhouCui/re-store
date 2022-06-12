using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    // ":" means derived from class IdentityDbContext (from EF)
    // Use custom entities User and Role, override Id type of all identity classes(tables) with <int>
    public class StoreContext : IdentityDbContext<User, Role, int>
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

            // alternative way to configure relationship
            builder.Entity<User>()
                .HasOne(a => a.Address) // 1 user has 1 address (navitagion property)
                .WithOne() // 1 address has 1 user
                .HasForeignKey<UserAddress>(a => a.Id) // Id is used as foreign key in UserAddress class
                .OnDelete(DeleteBehavior.Cascade); // delete a User should delete its address

            // add 2 roles into db when creating migrations
            // Role is a custom entity derived from IdentityRole with integer Id
            builder.Entity<Role>()
                .HasData(
                    // need to hard code Id, because type is changed to integer from string(GUID?)
                    new Role { Id = 1, Name = "Member", NormalizedName = "MEMBER" },
                    new Role { Id = 2, Name = "Admin", NormalizedName = "ADMIN" }
                );
        }
    }
}