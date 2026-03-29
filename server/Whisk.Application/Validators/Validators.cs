using FluentValidation;
using Whisk.Application.DTOs;

namespace Whisk.Application.Validators;

public class OnboardingRequestValidator : AbstractValidator<OnboardingRequest>
{
    public OnboardingRequestValidator()
    {
        RuleFor(x => x.Nickname).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
        RuleFor(x => x.IsOver18).Equal(true).WithMessage("Must be over 18");
        RuleFor(x => x.AcceptTerms).Equal(true).WithMessage("Must accept terms");
    }
}

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.Nickname).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}

public class AddTastingRequestValidator : AbstractValidator<AddTastingRequest>
{
    public AddTastingRequestValidator()
    {
        RuleFor(x => x.WhiskeyId).NotEmpty();
        RuleFor(x => x.TastingDate).NotEmpty();
        RuleFor(x => x.BodyDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.SmokeDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.SweetDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.AlcoholDelta).InclusiveBetween(-5, 5);
    }
}

public class UpdateTastingRequestValidator : AbstractValidator<UpdateTastingRequest>
{
    public UpdateTastingRequestValidator()
    {
        RuleFor(x => x.TastingDate).NotEmpty();
        RuleFor(x => x.BodyDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.SmokeDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.SweetDelta).InclusiveBetween(-5, 5);
        RuleFor(x => x.AlcoholDelta).InclusiveBetween(-5, 5);
    }
}

public class AddCollectionItemRequestValidator : AbstractValidator<AddCollectionItemRequest>
{
    public AddCollectionItemRequestValidator()
    {
        RuleFor(x => x.WhiskeyId).NotEmpty();
        RuleFor(x => x.PurchasePriceIls).GreaterThanOrEqualTo(0).When(x => x.PurchasePriceIls.HasValue);
    }
}

public class CreateWhiskeyRequestValidator : AbstractValidator<CreateWhiskeyRequest>
{
    public CreateWhiskeyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Country).NotEmpty();
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.VolumeML).GreaterThan(0);
        RuleFor(x => x.AlcoholPercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.MinMarketPriceIls).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxMarketPriceIls).GreaterThanOrEqualTo(x => x.MinMarketPriceIls).WithMessage("Max price must be >= min price");
        RuleFor(x => x.BodyProfile).InclusiveBetween(0, 10);
        RuleFor(x => x.SmokinessProfile).InclusiveBetween(0, 10);
        RuleFor(x => x.SweetnessProfile).InclusiveBetween(0, 10);
    }
}

public class UpdateWhiskeyRequestValidator : AbstractValidator<UpdateWhiskeyRequest>
{
    public UpdateWhiskeyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Country).NotEmpty();
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.VolumeML).GreaterThan(0);
        RuleFor(x => x.AlcoholPercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.MinMarketPriceIls).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxMarketPriceIls).GreaterThanOrEqualTo(x => x.MinMarketPriceIls);
        RuleFor(x => x.BodyProfile).InclusiveBetween(0, 10);
        RuleFor(x => x.SmokinessProfile).InclusiveBetween(0, 10);
        RuleFor(x => x.SweetnessProfile).InclusiveBetween(0, 10);
    }
}

public class CreateWhiskeyRequestDtoValidator : AbstractValidator<CreateWhiskeyRequestDto>
{
    public CreateWhiskeyRequestDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(200);
    }
}

public class UpdateMarketPricesRequestValidator : AbstractValidator<UpdateMarketPricesRequest>
{
    public UpdateMarketPricesRequestValidator()
    {
        RuleFor(x => x.MinMarketPriceIls).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxMarketPriceIls).GreaterThanOrEqualTo(x => x.MinMarketPriceIls);
    }
}

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
