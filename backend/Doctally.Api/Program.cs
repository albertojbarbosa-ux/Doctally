using System.Text;
using Anthropic;
using Doctally.Api.Data;
using Doctally.Api.Middleware;
using Doctally.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ICurrentTenant, CurrentTenant>();
builder.Services.AddScoped<Doctally.Api.Services.TokenService>();

builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection("Stripe"));
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
builder.Services.AddScoped<IModuleAccessService, ModuleAccessService>();

builder.Services.AddSingleton(new AnthropicClient { ApiKey = builder.Configuration["Anthropic:ApiKey"] });
builder.Services.AddScoped<IAnamneseIaService, AnthropicAnamneseIaService>();

var jwtChave = builder.Configuration["Jwt:Chave"] ?? "chave-de-desenvolvimento-trocar-em-producao";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Sem isso, o handler remapeia claims padrão do JWT (ex.: "sub" vira o URI legado
        // ClaimTypes.NameIdentifier) e User.FindFirst(JwtRegisteredClaimNames.Sub) sempre
        // retorna null — o que corrompia silenciosamente UsuarioId em LogAuditoria (sem FK,
        // nunca dava erro) e quebrava com 500 em qualquer entidade com FK para Usuarios.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Emissor"],
            ValidAudience = builder.Configuration["Jwt:Audiencia"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtChave)),
            // A claim "papel" já existe no token — reaproveitar como role padrão do ASP.NET
            // habilita [Authorize(Roles = "Admin")] sem precisar duplicar a informação.
            RoleClaimType = "papel",
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdmin", policy => policy.RequireClaim("super_admin", "true"));
});

builder.Services.AddDbContext<DoctallyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
