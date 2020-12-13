import { OMIDEventBridge } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Core } from 'Core/__mocks__/Core';
import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { OpenMeasurementVast } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';
describe('OmidEventBridge', () => {
    let omidEventBridge;
    let handler;
    let omInstance;
    let iframe;
    beforeEach(() => {
        handler = {
            onEventProcessed: jest.fn()
        };
        const core = new Core();
        const campaign = new AdMobCampaign();
        omInstance = new OpenMeasurementVast();
        jest.spyOn(Date, 'now').mockImplementation(() => 1000);
        iframe = document.createElement('iframe');
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: jest.fn()
            }
        });
        Object.defineProperty(iframe, 'id', { value: 'iframeId' });
        omidEventBridge = new OMIDEventBridge(core.Api, handler, iframe, omInstance, campaign);
    });
    describe('when triggering admob impression event', () => {
        it('should send postmessage event', () => {
            omidEventBridge.onEventRegistered('omidImpression', 'test', '1', 'iframeId');
            omidEventBridge.triggerVideoEvent('omidImpression');
            // tslint:disable-next-line
            expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith({ 'adSessionId': '', 'payload': undefined, 'timestamp': 1000, 'type': 'omidImpression', 'uuid': '1' }, '*');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21pZEV2ZW50QnJpZGdlLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL09wZW5NZWFzdXJlbWVudC9PbWlkRXZlbnRCcmlkZ2Uuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFxQixNQUFNLDJDQUEyQyxDQUFDO0FBQy9GLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxFQUEyQixtQkFBbUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBRW5ILFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7SUFFN0IsSUFBSSxlQUFnQyxDQUFDO0lBQ3JDLElBQUksT0FBMEIsQ0FBQztJQUUvQixJQUFJLFVBQW1DLENBQUM7SUFDeEMsSUFBSSxNQUF5QixDQUFDO0lBRTlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixPQUFPLEdBQUc7WUFDTixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1NBQzlCLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7UUFFckMsVUFBVSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2RCxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUU7WUFDM0MsS0FBSyxFQUFFO2dCQUNILFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO2FBQ3pCO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFM0QsZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO1FBQ3BELEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7WUFDckMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0UsZUFBZSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFcEQsMkJBQTJCO1lBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvSyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==