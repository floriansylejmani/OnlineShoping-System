using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace OnlineShop.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var validatorTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(type => !type.IsAbstract && !type.IsInterface)
            .Select(type => new
            {
                Implementation = type,
                Interface = type.GetInterfaces()
                    .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidator<>))
            })
            .Where(type => type.Interface is not null);

        foreach (var validator in validatorTypes)
            services.AddScoped(validator.Interface!, validator.Implementation);

        return services;
    }
}
