import { ThirdPartyEventManager, ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
describe('ThirdPartyEventManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let failedPTSEventManager;
    let storageBridge;
    let thirdPartyEventManager;
    let request;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        failedPTSEventManager = sinon.createStubInstance(FailedPTSEventManager);
        storageBridge = sinon.createStubInstance(StorageBridge);
        request = sinon.createStubInstance(RequestManager);
        request.get.returns(Promise.resolve({}));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {}, storageBridge);
    });
    it('Send successful third party event', () => {
        const url = 'https://www.example.net/third_party_event';
        const requestSpy = request.get;
        thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url);
        assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
        assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
    });
    it('Send click attribution event', () => {
        const url = 'https://www.example.net/third_party_event';
        const requestSpy = request.get;
        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });
    it('should send headers for event', () => {
        const url = 'https://www.example.net/third_party_event';
        const requestSpy = request.get;
        return thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url, true).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            let userAgentHeaderExists = false;
            for (const header of requestSpy.getCall(0).args[1]) {
                if (header[0] === 'User-Agent') {
                    userAgentHeaderExists = true;
                }
            }
            assert.isTrue(userAgentHeaderExists, 'User-Agent header should exist in headers');
        });
    });
    it('should overwrite the options of an internal pts tracking url', () => {
        const url = 'https://tracking.prd.mz.internal.unity3d.com/third_party_event';
        const requestOptionsToTest = {
            retries: 2,
            retryDelay: 10000,
            followRedirects: true,
            retryWithConnectionEvents: false
        };
        const requestStub = request.get;
        thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url);
        assert(requestStub.calledOnce);
        assert.equal(url, requestStub.getCall(0).args[0]);
        assert.deepEqual(requestOptionsToTest, requestStub.getCall(0).args[2], 'Internal tracking options were not overwritten');
    });
    it('should queue to store failed internal unity tracking event', () => {
        const url = 'https://tracking.prd.mz.internal.unity3d.com/third_party_event';
        const requestStub = request.get;
        const queueStub = storageBridge.queue;
        requestStub.returns(Promise.reject());
        queueStub.returns({});
        return thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url).then(() => {
            assert.fail();
        }).catch(() => {
            sinon.assert.calledOnce(queueStub);
        });
    });
    it('should replace "%ZONE%" in the url with the placement id', () => {
        const requestSpy = request.get;
        const urlTemplate = 'http://foo.biz/%ZONE%/123';
        const placement = TestFixtures.getPlacement();
        thirdPartyEventManager.setTemplateValues({ [ThirdPartyEventMacro.ZONE]: placement.getId() });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/' + placement.getId() + '/123', 'Should have replaced %ZONE% from the url');
    });
    it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
        const requestSpy = request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager.setTemplateValues({ [ThirdPartyEventMacro.SDK_VERSION]: '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });
    it('should replace template values given in constructor', () => {
        const requestSpy = request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, { [ThirdPartyEventMacro.SDK_VERSION]: '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });
    it('should replace template values added through setTemplateValue', () => {
        const requestSpy = request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {});
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.SDK_VERSION, '12346');
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12346/123', 'Should have replaced %SDK_VERSION% from the url');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL1RoaXJkUGFydHlFdmVudE1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxvQkFBb0IsRUFBaUIsTUFBTSxxQ0FBcUMsQ0FBQztBQUVsSCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDeEMsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxJQUFjLENBQUM7SUFDbkIsSUFBSSxxQkFBNEMsQ0FBQztJQUNqRCxJQUFJLGFBQTRCLENBQUM7SUFFakMsSUFBSSxzQkFBOEMsQ0FBQztJQUNuRCxJQUFJLE9BQXVCLENBQUM7SUFFNUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEs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