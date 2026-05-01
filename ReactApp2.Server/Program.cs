using Microsoft.EntityFrameworkCore;
using ReactApp2.Server.Controllers;
using ReactApp2.Server.Data; 
using ReactApp2.Server.Models;
using ReactApp2.Server.Services;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName?.Replace("+", ".") ?? type.Name);
});
builder.Services.AddHostedService<ReactApp2.Server.BackgroundServices.OrderStatusUpdaterService>();
builder.Services.AddHostedService<ReactApp2.Server.BackgroundServices.OrderReminderService>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentityApiEndpoints<User>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddHttpClient<GeminiVisionService>();
builder.Services.AddHttpClient("Monobank", client =>
{
    client.BaseAddress = new Uri("https://api.monobank.ua/");
    client.DefaultRequestHeaders.Add("X-Token", builder.Configuration["Monobank:XToken"]);
});

builder.Services.AddTransient<IEmailService, EmailService>();
// Також переконайтеся, щоIdentity налаштовано з вимогою унікального email:
// options.User.RequireUniqueEmail = true;

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGroup("/api").MapIdentityApi<User>();

app.MapControllers();

app.MapFallbackToFile("/index.html");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Сталася помилка при наповненні бази даних.");
    }
}

app.Run();
