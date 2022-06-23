var builder = WebApplication.CreateBuilder(args);

// use "builder.Services" to add services to the Dependency Injection Container

builder.Services.AddControllers();

// tell automapper which assembly to look inside of to find MappingProfiles
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

builder.Services.AddSwaggerGen(c =>
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
builder.Services.AddDbContext<StoreContext>(options =>
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
        connStr = builder.Configuration.GetConnectionString("DefaultConnection");
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
builder.Services.AddCors();
// Add identity configuration
builder.Services.AddIdentityCore<User>(opt =>
{
    // don't allow duplicate email
    opt.User.RequireUniqueEmail = true;
})
    .AddRoles<Role>() // Role is a custom entity derived from IdentityRole with Id type of integer
    .AddEntityFrameworkStores<StoreContext>(); // add all identity tables (AspNetRoles, AspNetUserLogins etc.)
                                               // Add Authentication with JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
                .GetBytes(builder.Configuration["JWTSettings:TokenKey"]))
        };
    });
// Add Authorization
builder.Services.AddAuthorization();
// add JWT token service, so that it can be injected into account controller
builder.Services.AddScoped<TokenService>();
// PaymentService will be injected into PaymentController
builder.Services.AddScoped<PaymentService>();
// add Cloudinary service for injection
builder.Services.AddScoped<ImageService>();

// Create the configured Web Application (and Kestrel server)
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (builder.Environment.IsDevelopment())
{
    // app.UseDeveloperExceptionPage(); // use custom exception middleware instead of this one
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
}

// app.UseHttpsRedirection(); // not using HTTPS in dev mode

// app.UseRouting(); // no longer used in .NET 6

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

app.MapControllers();
// for routing issue's fallback
app.MapFallbackToController("Index", "Fallback");

// Below are from the original Main method
// Create scope to add service, keyword "using" will auto dispose the scope when it's no longer used
using var scope = app.Services.CreateScope();
// Add services into scope
var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
// Get UserManager service
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
// run scoped services in a try-catch block
try
{
    // programatically run migration, instead of using CLI command `dotnet ef database update`
    await context.Database.MigrateAsync();
    // pupulate database if no data found
    await DbInitializer.Initialize(context, userManager);
}
catch (System.Exception ex)
{
    logger.LogError(ex, "Problem migrating data");
}

// Run the application
await app.RunAsync();
