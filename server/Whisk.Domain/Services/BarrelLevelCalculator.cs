namespace Whisk.Domain.Services;

public static class BarrelLevelCalculator
{
    public static int Calculate(int totalBottlesEverAdded)
    {
        int level = totalBottlesEverAdded / 5;
        return Math.Min(level, 5);
    }
}
