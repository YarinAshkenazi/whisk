using Whisk.Domain.Entities;

namespace Whisk.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
