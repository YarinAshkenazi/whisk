using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Whisk.Application.Interfaces;
using Whisk.Infrastructure.Persistence;
using Whisk.Infrastructure.Services;

namespace Whisk.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<WhiskDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(WhiskDbContext).Assembly.FullName)));

        services.AddScoped<IWhiskDbContext>(provider => provider.GetRequiredService<WhiskDbContext>());
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IRecommendationService, RecommendationService>();
        services.AddSingleton<IPushNotificationService, ExpoPushService>();

        return services;
    }
}
