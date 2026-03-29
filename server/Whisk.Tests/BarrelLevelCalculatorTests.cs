using Whisk.Domain.Services;

namespace Whisk.Tests;

public class BarrelLevelCalculatorTests
{
    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 0)]
    [InlineData(4, 0)]
    [InlineData(5, 1)]
    [InlineData(9, 1)]
    [InlineData(10, 2)]
    [InlineData(15, 3)]
    [InlineData(20, 4)]
    [InlineData(25, 5)]
    [InlineData(30, 5)]
    [InlineData(100, 5)]
    public void Calculate_ReturnsCorrectLevel(int bottles, int expectedLevel)
    {
        var result = BarrelLevelCalculator.Calculate(bottles);
        Assert.Equal(expectedLevel, result);
    }

    [Fact]
    public void Calculate_NeverExceedsFive()
    {
        for (int i = 0; i <= 1000; i++)
        {
            var result = BarrelLevelCalculator.Calculate(i);
            Assert.InRange(result, 0, 5);
        }
    }
}
