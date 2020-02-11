import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { Core } from 'Core/__mocks__/Core';

import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { ICoreApi } from 'Core/ICore';

describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;
    let urlTemplate: string;

    beforeEach(() => {
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';

        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {[ThirdPartyEventMacro.OMIDPARTNER]: OMID_P, [ThirdPartyEventMacro.CACHEBUSTING]: '-1'});
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
    });
});
