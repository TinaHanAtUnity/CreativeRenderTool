import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { ICoreApi } from 'Core/ICore';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurement';

describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;

    beforeEach(() => {
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {[ThirdPartyEventMacro.OMIDPARTNER]: OMID_P});
    });

    describe('when replacing Open Measurement Macros', () => {
        let urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';

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
            urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&omidpartner=%5BOMIDPARTNER%5D';
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25&omidpartner=Unity3d/1.2.10', expect.anything(), expect.anything());
        });
    });
});
