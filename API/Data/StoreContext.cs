using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    // ":" means derived from class DbContext (from EF)
    public class StoreContext : DbContext
    {
        // constructor to pass in options (e.g. DB connection string)
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        // For each entity, create a DbSet (table)
        public DbSet<Product> Products { get; set; } // "Products" is table's name

        public DbSet<Basket> Baskets { get; set; } // Baskets table
    }
}