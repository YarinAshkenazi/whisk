using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Whisk.Application.Interfaces;

namespace Whisk.Infrastructure.Services;

public class ExpoPushService : IPushNotificationService
{
    private static readonly HttpClient Http = new();
    private const string ExpoEndpoint = "https://exp.host/--/api/v2/push/send";
    private readonly ILogger<ExpoPushService> _logger;

    public ExpoPushService(ILogger<ExpoPushService> logger) => _logger = logger;

    public async Task<bool> SendAsync(string expoPushToken, string title, string body, object? data = null)
    {
        if (string.IsNullOrWhiteSpace(expoPushToken) || !expoPushToken.StartsWith("ExponentPushToken["))
        {
            _logger.LogWarning("Invalid Expo push token: {Token}", expoPushToken);
            return false;
        }

        try
        {
            var payload = new
            {
                to = expoPushToken,
                sound = "default",
                title,
                body,
                data
            };

            var response = await Http.PostAsJsonAsync(ExpoEndpoint, payload);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Expo push failed with status {Status}", response.StatusCode);
                return false;
            }

            _logger.LogInformation("Push notification sent to {Token}", expoPushToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send push notification");
            return false;
        }
    }
}
