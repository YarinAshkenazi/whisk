using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Whisk.Application.Interfaces;
using Whisk.Infrastructure.Persistence;
using Whisk.Infrastructure.Services;

namespace Whisk.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection") ?? "";
        var dataSourceBuilder = new NpgsqlDataSourceBuilder(connStr);
        var dataSource = dataSourceBuilder.Build();

        services.AddDbContext<WhiskDbContext>(options =>
            options.UseNpgsql(dataSource, b =>
            {
                b.MigrationsAssembly(typeof(WhiskDbContext).Assembly.FullName);
                b.CommandTimeout(60);
            }));

        services.AddScoped<IWhiskDbContext>(provider => provider.GetRequiredService<WhiskDbContext>());
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IRecommendationService, RecommendationService>();
        services.AddSingleton<IPushNotificationService, ExpoPushService>();

        return services;
    }
}
