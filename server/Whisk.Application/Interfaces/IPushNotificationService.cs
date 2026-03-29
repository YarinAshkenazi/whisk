namespace Whisk.Application.Interfaces;

public interface IPushNotificationService
{
    Task<bool> SendAsync(string expoPushToken, string title, string body, object? data = null);
}
