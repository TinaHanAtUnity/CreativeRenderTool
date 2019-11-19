import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { ICoreApi } from 'Core/ICore';

describe('ThirdPartyEventManagerTest', () => {
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;

    beforeEach(() => {
        const platform = Platform.ANDROID;
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
    });

    it('should replace "%25OM_ENABLED%25" in the url with the placement id', () => {

        const urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25';
        thirdPartyEventManager.setTemplateValues({[ThirdPartyEventMacro.OM_ENABLED]: 'true'});
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);

        expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=true', [], {'followRedirects': true, 'retries': 0, 'retryDelay': 0, 'retryWithConnectionEvents': false});
    });

    it('should replace "%25OM_VENDORS%25" in the url with the placement id', () => {
        const urlTemplate = 'http://foo.biz/123?om_vendors=%25OM_VENDORS%25';
        thirdPartyEventManager.setTemplateValues({[ThirdPartyEventMacro.OM_VENDORS]: 'value1|value2|value3'});
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);

        expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?om_vendors=value1%7Cvalue2%7Cvalue3', [], {'followRedirects': true, 'retries': 0, 'retryDelay': 0, 'retryWithConnectionEvents': false});
    });
});
