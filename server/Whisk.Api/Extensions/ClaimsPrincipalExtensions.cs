using System.Security.Claims;

namespace Whisk.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(id, out var guid) ? guid : throw new UnauthorizedAccessException("Invalid user token");
    }

    public static string GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Role) ?? "User";
    }
}
