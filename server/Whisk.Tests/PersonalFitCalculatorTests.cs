using Whisk.Domain.Services;

namespace Whisk.Tests;

public class PersonalFitCalculatorTests
{
    [Fact]
    public void Calculate_AllZeros_Returns100()
    {
        var result = PersonalFitCalculator.Calculate(0, 0, 0, 0);
        Assert.Equal(100, result);
    }

    [Fact]
    public void Calculate_AllMaxPositive_Returns0()
    {
        var result = PersonalFitCalculator.Calculate(5, 5, 5, 5);
        Assert.Equal(0, result);
    }

    [Fact]
    public void Calculate_AllMaxNegative_Returns0()
    {
        var result = PersonalFitCalculator.Calculate(-5, -5, -5, -5);
        Assert.Equal(0, result);
    }

    [Fact]
    public void Calculate_MixedValues_ReturnsExpected()
    {
        // body=1 -> 0.8, smoke=-2 -> 0.6, sweet=0 -> 1.0, alcohol=3 -> 0.4
        // weighted: 0.6*0.35 + 1.0*0.30 + 0.8*0.20 + 0.4*0.15 = 0.21 + 0.30 + 0.16 + 0.06 = 0.73
        var result = PersonalFitCalculator.Calculate(1, -2, 0, 3);
        Assert.Equal(73, result);
    }

    [Fact]
    public void Calculate_SmallDeltas_ReturnsHighPercent()
    {
        var result = PersonalFitCalculator.Calculate(1, 1, 1, 1);
        Assert.True(result >= 70);
    }

    [Theory]
    [InlineData(0, 0, 0, 0, 100)]
    [InlineData(5, 5, 5, 5, 0)]
    [InlineData(-5, -5, -5, -5, 0)]
    [InlineData(0, 0, 0, 5, 85)]
    public void Calculate_Theory_ReturnsExpected(int body, int smoke, int sweet, int alcohol, int expected)
    {
        var result = PersonalFitCalculator.Calculate(body, smoke, sweet, alcohol);
        Assert.Equal(expected, result);
    }
}
