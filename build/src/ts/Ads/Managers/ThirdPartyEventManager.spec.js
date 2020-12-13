import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { Core } from 'Core/__mocks__/Core';
import { ThirdPartyEventMacro, ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager;
    let request;
    let urlTemplate;
    beforeEach(() => {
        const core = new Core().Api;
        request = new RequestManager();
        urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, { [ThirdPartyEventMacro.OMIDPARTNER]: OMID_P, [ThirdPartyEventMacro.CACHEBUSTING]: '-1', [ThirdPartyEventMacro.AD_UNIT_ID_IMPRESSION]: 'test_adunit_id', [ThirdPartyEventMacro.AD_UNIT_ID_OPERATIVE]: 'test_adunit_id' });
    });
    describe('when replacing Open Measurement Macros', () => {
        it('should replace om_enabled macro correctly', () => {
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, 'true');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=true&om_vendors=%25OM_VENDORS%25', expect.anything(), expect.anything());
        });
        it('should replace om_vendors macro correctly', () => {
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, 'value1|value2|value3');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=value1%7Cvalue2%7Cvalue3', expect.anything(), expect.anything());
        });
        it('should replace omidpartner macro correctly', () => {
            urlTemplate = urlTemplate + '&omidpartner=[OMIDPARTNER]';
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&omidpartner=Unity3d/1.2.10', expect.anything(), expect.anything());
        });
        it('should replace other vast tracking macros correctly', () => {
            urlTemplate = urlTemplate + '&timestamp=[TIMESTAMP]&cachebusting=[CACHEBUSTING]';
            Date.prototype.toISOString = jest.fn(() => '2020-02-05T23:42:46.149Z');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&timestamp=2020-02-05T23:42:46.149Z&cachebusting=-1', expect.anything(), expect.anything());
        });
        it('should replace the additional reason code macro correctly', () => {
            urlTemplate = urlTemplate + '&reason=%5BREASON%5D';
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate, undefined, undefined, { '%5BREASON%5D': '1' });
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&reason=1', expect.anything(), expect.anything());
        });
    });
    describe('when replacing AdUnitId macro', () => {
        it('should replace adUnitId for oprative events', () => {
            urlTemplate = urlTemplate + '&adUnitId=%AD_UNIT_ID%';
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&adUnitId=test_adunit_id', expect.anything(), expect.anything());
        });
        it('should replace adUnitId for operative events', () => {
            urlTemplate = urlTemplate + '&adUnitId=%25AD_UNIT_ID%25';
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&adUnitId=test_adunit_id', expect.anything(), expect.anything());
        });
    });
    describe('sendTrackingEvents', () => {
        beforeEach(() => {
            return thirdPartyEventManager.sendTrackingEvents(Campaign(), TrackingEvent.IMPRESSION, '');
        });
        it('should call requestManager.post', () => {
            expect(request.post).toBeCalledTimes(1);
        });
        it('should call requestManager.post with correct parameters', () => {
            const metricData = JSON.stringify({
                metrics: [
                    {
                        name: 'impression_duplicate_non_batching',
                        value: 1,
                        tags: ['ads_sdk2_tst:true']
                    }
                ]
            });
            const ptsHeaders = [['Content-Type', 'application/json']];
            const requestOptions = {
                retries: 2,
                retryDelay: 0,
                retryWithConnectionEvents: false,
                followRedirects: false
            };
            expect(request.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', metricData, ptsHeaders, requestOptions);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9UaGlyZFBhcnR5RXZlbnRNYW5hZ2VyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBc0IsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ2xILE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUVuRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHekQsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtJQUN4QyxJQUFJLHNCQUE4QyxDQUFDO0lBQ25ELElBQUksT0FBMkIsQ0FBQztJQUNoQyxJQUFJLFdBQW1CLENBQUM7SUFFeEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLE1BQU0sSUFBSSxHQUFhLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ3RDLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQy9CLFdBQVcsR0FBRywrRUFBK0UsQ0FBQztRQUU5RixzQkFBc0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FB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