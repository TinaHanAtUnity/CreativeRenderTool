import 'mocha';
import { assert } from 'chai';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
describe('VastCreativeValidatorTest', () => {
    describe('getErrors', () => {
        it('should return no errors when given a valid creative', () => {
            const creative = new VastCreativeLinear(30, 10, [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)], 'http://google.com/clickThrough?someQuery=test&other=no', ['http://reddit.com/click', 'https://reddit.com/thridparty/click?someQuery=test&other=no'], ['http://google.com/custom/click?someQuery=test&other=no'], 'test');
            creative.addTrackingEvent('click', 'http://google.com/click');
            creative.addTrackingEvent('click', 'http://google.com/click2');
            creative.addTrackingEvent('impression', 'http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%');
            const errors = new VastCreativeValidator(creative).getErrors();
            assert.lengthOf(errors, 0, VastValidationUtilities.formatErrors(errors));
        });
        it('should return errors when given an invalid creative', () => {
            const creative = new VastCreativeLinear(30, 10, [new VastMediaFile('', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)], '', ['reddit.com/click', 'click?someQuery=test&other=no'], [''], 'test');
            creative.addTrackingEvent('click', 'google.com/click');
            creative.addTrackingEvent('click', '');
            creative.addTrackingEvent('impression', 'http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%');
            const errors = new VastCreativeValidator(creative).getErrors();
            assert.lengthOf(errors, 2);
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST creative trackingEvents contains invalid url("google.com/click")\n    VAST creative trackingEvents contains invalid url("")');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENyZWF0aXZlVmFsaWRhdG9yVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9WQVNUL1ZhbGlkYXRvci9WYXN0Q3JlYXRpdmVWYWxpZGF0b3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFHbEYsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtJQUN2QyxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUN2QixFQUFFLENBQUMscURBQXFELEVBQUUsR0FBRyxFQUFFO1lBQzNELE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQ25DLEVBQUUsRUFDRixFQUFFLEVBQ0YsQ0FBQyxJQUFJLGFBQWEsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUNySCx3REFBd0QsRUFDeEQsQ0FBQyx5QkFBeUIsRUFBRSw2REFBNkQsQ0FBQyxFQUMxRixDQUFDLHdEQUF3RCxDQUFDLEVBQzFELE1BQU0sQ0FBQyxDQUFDO1lBQ1osUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQzlELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztZQUMvRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLDBRQUEwUSxDQUFDLENBQUM7WUFFcFQsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvRCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMscURBQXFELEVBQUUsR0FBRyxFQUFFO1lBQzNELE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQ25DLEVBQUUsRUFDRixFQUFFLEVBQ0YsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDL0YsRUFBRSxFQUNGLENBQUMsa0JBQWtCLEVBQUUsK0JBQStCLENBQUMsRUFDckQsQ0FBQyxFQUFFLENBQUMsRUFDSixNQUFNLENBQUMsQ0FBQztZQUNaLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUN2RCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsMFFBQTBRLENBQUMsQ0FBQztZQUVwVCxNQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGtJQUFrSSxDQUFDLENBQUM7UUFDbk0sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=