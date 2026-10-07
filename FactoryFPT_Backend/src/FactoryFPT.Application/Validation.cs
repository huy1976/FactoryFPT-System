using FluentValidation;

namespace FactoryFPT.Application;

public sealed class CreateDeviceRequestValidator : AbstractValidator<CreateDeviceRequest>
{
    public CreateDeviceRequestValidator() { RuleFor(x => x.DeviceCode).NotEmpty().MaximumLength(64); RuleFor(x => x.Name).NotEmpty().MaximumLength(128); }
}
public sealed class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
{
    public CreateSessionRequestValidator() { RuleFor(x => x.DeviceCode).NotEmpty().MaximumLength(64); }
}
public sealed class SensorBatchRequestValidator : AbstractValidator<SensorBatchRequest>
{
    public SensorBatchRequestValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.Samples).NotEmpty().Must(x => x.Count <= 1000).WithMessage("Maximum 1000 samples per batch.");
        RuleForEach(x => x.Samples).SetValidator(new SensorSampleRequestValidator());
    }
}
public sealed class SensorSampleRequestValidator : AbstractValidator<SensorSampleRequest>
{
    public SensorSampleRequestValidator()
    {
        RuleFor(x => x.SensorId).NotEmpty().MaximumLength(64);
        RuleFor(x => x.TimestampUtc).NotEqual(default(DateTime));
        RuleFor(x => x.ForceN).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100000);
        RuleFor(x => x.AngleDeg).GreaterThanOrEqualTo(-360000).LessThanOrEqualTo(360000);
    }
}
