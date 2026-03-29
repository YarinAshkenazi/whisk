namespace Whisk.Domain.Services;

public static class PersonalFitCalculator
{
    private const double SmokeWeight = 0.35;
    private const double SweetWeight = 0.30;
    private const double BodyWeight = 0.20;
    private const double AlcoholWeight = 0.15;
    private const double MaxDelta = 5.0;

    public static int Calculate(int bodyDelta, int smokeDelta, int sweetDelta, int alcoholDelta)
    {
        double bodyScore = 1.0 - (Math.Abs(bodyDelta) / MaxDelta);
        double smokeScore = 1.0 - (Math.Abs(smokeDelta) / MaxDelta);
        double sweetScore = 1.0 - (Math.Abs(sweetDelta) / MaxDelta);
        double alcoholScore = 1.0 - (Math.Abs(alcoholDelta) / MaxDelta);

        double weightedScore = (smokeScore * SmokeWeight)
                             + (sweetScore * SweetWeight)
                             + (bodyScore * BodyWeight)
                             + (alcoholScore * AlcoholWeight);

        return (int)Math.Round(weightedScore * 100);
    }
}
