using FactoryFPT.Application;
using Xunit;

namespace FactoryFPT.Tests;
public class ValidationTests
{
 [Fact] public void InvalidBatchSize_IsRejected(){var v=new SensorBatchRequestValidator();var r=v.Validate(new SensorBatchRequest(Guid.NewGuid(),Enumerable.Range(0,1001).Select(_=>new SensorSampleRequest("S",DateTime.UtcNow,1,1,0,0,0)).ToList()));Assert.False(r.IsValid);}
 [Fact] public void NegativeForce_IsRejected(){var v=new SensorSampleRequestValidator();var r=v.Validate(new SensorSampleRequest("S",DateTime.UtcNow,-1,1,0,0,0));Assert.False(r.IsValid);}
}
