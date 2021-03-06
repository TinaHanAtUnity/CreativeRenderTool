import { ThirdPartyEventManager, ThirdPartyEventMacro, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { RequestManager } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('ThirdPartyEventManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let failedPTSEventManager: FailedPTSEventManager;
    let storageBridge: StorageBridge;

    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        failedPTSEventManager = sinon.createStubInstance(FailedPTSEventManager);
        storageBridge = sinon.createStubInstance(StorageBridge);

        request = sinon.createStubInstance(RequestManager);
        (<sinon.SinonStub>request.get).returns(Promise.resolve({}));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {}, storageBridge);
    });

    it('Send successful third party event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = <sinon.SinonSpy>request.get;

        thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url);
        assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
        assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
    });

    it('Send click attribution event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = <sinon.SinonSpy>request.get;

        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('should send headers for event', () => {
        const url: string = 'https://www.example.net/third_party_event';
        const requestSpy = <sinon.SinonSpy>request.get;

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
        const url: string = 'https://tracking.prd.mz.internal.unity3d.com/third_party_event';
        const requestOptionsToTest = {
            retries: 2,
            retryDelay: 10000,
            followRedirects: true,
            retryWithConnectionEvents: false
        };

        const requestStub = <sinon.SinonStub>request.get;

        thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url);
        assert(requestStub.calledOnce);
        assert.equal(url, requestStub.getCall(0).args[0]);
        assert.deepEqual(requestOptionsToTest, requestStub.getCall(0).args[2], 'Internal tracking options were not overwritten');
    });

    it('should queue to store failed internal unity tracking event', () => {
        const url: string = 'https://tracking.prd.mz.internal.unity3d.com/third_party_event';
        const requestStub = <sinon.SinonStub>request.get;
        const queueStub = <sinon.SinonStub>storageBridge.queue;
        requestStub.returns(Promise.reject());
        queueStub.returns({});

        return thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url).then(() => {
            assert.fail();
        }).catch(() => {
            sinon.assert.calledOnce(queueStub);
        });
    });

    it('should replace "%ZONE%" in the url with the placement id', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%ZONE%/123';
        const placement = TestFixtures.getPlacement();
        thirdPartyEventManager.setTemplateValues({ [ThirdPartyEventMacro.ZONE]: placement.getId() });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/' + placement.getId() + '/123', 'Should have replaced %ZONE% from the url');
    });

    it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager.setTemplateValues({ [ThirdPartyEventMacro.SDK_VERSION]: '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    it('should replace template values given in constructor', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, { [ThirdPartyEventMacro.SDK_VERSION]: '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    it('should replace template values added through setTemplateValue', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {});
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.SDK_VERSION, '12346');
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12346/123', 'Should have replaced %SDK_VERSION% from the url');
    });
});
