using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Whisk.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining(typeof(DependencyInjection));
        return services;
    }
}
