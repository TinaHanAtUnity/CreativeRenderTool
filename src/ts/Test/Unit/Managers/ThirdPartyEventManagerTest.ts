import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { RequestApi } from 'Native/Api/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

class TestRequestApi extends RequestApi {

    public get(id: string, url: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

    public post(id: string, url: string, body?: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

}

describe('ThirdPartyEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let requestApi: TestRequestApi;
    let focusManager: FocusManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let metaDataManager: MetaDataManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
    });

    it('Send successful third party event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('Send click attribution event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('should send headers for event', () => {
        const url: string = 'https://www.example.net/third_party_event';
        const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89';
        const headers = [['User-Agent', userAgent]];

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url, true).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.deepEqual(headers, requestSpy.getCall(0).args[1], 'Click attribution event headers do not match');
        });
    });
});
