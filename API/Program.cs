using API.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Create Kestrel server
            var host = CreateHostBuilder(args).Build();
            // Create scope to add service, keyword "using" will auto disopse the scope when it's no longer used
            using var scope = host.Services.CreateScope();
            // Add services into scope
            var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            // run scoped services in a try-catch block
            try
            {
                // programatically run migration, instead of using CLI command `dotnet ef database update`
                context.Database.Migrate();
                // pupulate database if no data found
                DbInitializer.Initialize(context);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Problem migrating data");
            }

            // run the server
            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    // use Startup class for additional configuration and services
                    webBuilder.UseStartup<Startup>();
                });
    }
}
