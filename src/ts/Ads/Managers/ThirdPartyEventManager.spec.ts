import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { ICoreApi } from 'Core/ICore';

describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;

    beforeEach(() => {
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
    });

    describe('when replacing Open Measurement Macros', () => {
        it('should replace om_enabled and omVendors macros correctly', () => {
            const urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, 'true');
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, 'value1|value2|value3');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=true&om_vendors=value1%7Cvalue2%7Cvalue3', [], {'followRedirects': true, 'retries': 0, 'retryDelay': 0, 'retryWithConnectionEvents': false});
        });
    });
});
