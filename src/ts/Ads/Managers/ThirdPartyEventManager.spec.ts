import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { Core } from 'Core/__mocks__/Core';

import { ThirdPartyEventMacro, ThirdPartyEventManager, TrackingEvent, UnityEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { ICoreApi } from 'Core/ICore';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { Placement } from 'Ads/Models/__mocks__/Placement';

describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;
    let urlTemplate: string;

    beforeEach(() => {
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';

        thirdPartyEventManager = new ThirdPartyEventManager(core, request, { [ThirdPartyEventMacro.OMIDPARTNER]: OMID_P, [ThirdPartyEventMacro.CACHEBUSTING]: '-1', [UnityEventMacro.AD_UNIT_ID_IMPRESSION]: 'test_adunit_id', [UnityEventMacro.AD_UNIT_ID_OPERATIVE]: 'test_adunit_id' });
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
