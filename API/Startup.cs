using System;
using System.Collections.Generic;
using System.Text;
using API.Data;
using API.Entities;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace API
{
    public class Startup
    {
        // Construtor: inject configuration from appsettings.json (e.g. DB connection string)
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container. (Dependency Injection Container)
        // The services in this method can be injected into other classes (e.g. controllers)
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
                // boiler plate for swagger to use JWT bearer token in auth header
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "Jwt auth header",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                // boiler plate
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
            });

            // Database connection in dev and prod
            services.AddDbContext<StoreContext>(options =>
            {
                // pass in option for SQLite connection string
                // options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));

                // Use postgres container in localhost
                // options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection"));

                // ASPNETCORE_ENVIRONMENT is similar to NODE_ENV, it will be "Production" in Heroku
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

                string connStr;

                if (env == "Development")
                {
                    // Use connection string from file, connection to postgres docker container (localhost)
                    connStr = Configuration.GetConnectionString("DefaultConnection");
                }
                else
                {
                    // Use connection string provided at runtime by Heroku.
                    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                    // Parse connection URL to connection string for Npgsql
                    connUrl = connUrl.Replace("postgres://", string.Empty);
                    var pgUserPass = connUrl.Split("@")[0];
                    var pgHostPortDb = connUrl.Split("@")[1];
                    var pgHostPort = pgHostPortDb.Split("/")[0];
                    var pgDb = pgHostPortDb.Split("/")[1];
                    var pgUser = pgUserPass.Split(":")[0];
                    var pgPass = pgUserPass.Split(":")[1];
                    var pgHost = pgHostPort.Split(":")[0];
                    var pgPort = pgHostPort.Split(":")[1];

                    connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};SSL Mode=Require;Trust Server Certificate=true";
                }

                // Whether the connection string came from the local development configuration file
                // or from the environment variable from Heroku, use it to set up your DbContext.
                options.UseNpgsql(connStr);
            });

            // Add CORS
            services.AddCors();
            // Add identity configuration
            services.AddIdentityCore<User>(opt =>
            {
                // don't allow duplicate email
                opt.User.RequireUniqueEmail = true;
            })
                .AddRoles<Role>() // Role is a custom entity derived from IdentityRole with Id type of integer
                .AddEntityFrameworkStores<StoreContext>(); // add all identity tables (AspNetRoles, AspNetUserLogins etc.)
            // Add Authentication with JWT
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt =>
                {
                    // validate JWT
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false, // API
                        ValidateAudience = false, // Client
                        ValidateLifetime = true, // check expiry date
                        ValidateIssuerSigningKey = true, // check JWT signature
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                            .GetBytes(Configuration["JWTSettings:TokenKey"]))
                    };
                });
            // Add Authorization
            services.AddAuthorization();
            // add JWT token service, so that it can be injected into account controller
            services.AddScoped<TokenService>();
            // PaymentService will be injected into PaymentController
            services.AddScoped<PaymentService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline. (Middleware)
        // The ORDER of middlewares is very important
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // use custom exception middleware
            app.UseMiddleware<ExceptionMiddleware>();

            if (env.IsDevelopment())
            {
                // app.UseDeveloperExceptionPage(); // use custom exception middleware instead of this one
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
            }

            // app.UseHttpsRedirection(); // not using HTTPS in dev mode

            app.UseRouting();

            // for serving static frontend files in wwwroot
            app.UseDefaultFiles();
            app.UseStaticFiles();

            // CORS middleware must come after UseRouting()
            app.UseCors(opt =>
            {
                opt
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials() // pass cookies to/from client
                    .WithOrigins("http://localhost:3000");
            });

            // middleware for authentication
            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                // for routing issue's fallback
                endpoints.MapFallbackToController("Index", "Fallback");
            });
        }
    }
}
