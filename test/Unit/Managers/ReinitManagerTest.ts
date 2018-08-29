import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse, Request } from 'Utilities/Request';
import { Cache } from 'Utilities/Cache';
import { ReinitManager } from 'Managers/ReinitManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';
import { StorageApi } from 'Native/Api/Storage';
import { Platform } from 'Constants/Platform';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

class TestHelper {
    public static getClientInfo(webviewhash: string | null) {
        return new ClientInfo(Platform.TEST, [
            '12345',
            false,
            'com.unity3d.ads.example',
            '2.0.0-test2',
            2000,
            '2.0.0-alpha2',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            webviewhash,
            '2.0.0-webview',
            123456,
            false
        ]);
    }
}

describe('ReinitManagerTest', () => {
    describe('reinitialize', () => {
        let nativeBridge: NativeBridge;
        let clientInfo: ClientInfo;
        let request: Request;
        let cache: Cache;
        let reinitManager: ReinitManager;
        let programmaticTrackingService: ProgrammaticTrackingService;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            nativeBridge.Storage = new StorageApi(nativeBridge);
            clientInfo = TestFixtures.getClientInfo();
            const wakeUpManager = new WakeUpManager(nativeBridge, new FocusManager(nativeBridge));
            request = new Request(nativeBridge, wakeUpManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            cache = new Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping(nativeBridge), programmaticTrackingService);
            reinitManager = new ReinitManager(nativeBridge, clientInfo, request, cache);
        });

        it('should reinitialize', () => {
            const spy = sinon.spy(nativeBridge.Sdk, 'reinitialize');

            reinitManager.reinitialize();

            assert.isTrue(spy.called, 'native reinitialize method was not invoked');
        });
    });

    describe('shouldReinitialize', () => {
        let nativeBridge: NativeBridge;
        let request: Request;
        let cache: Cache;
        let programmaticTrackingService: ProgrammaticTrackingService;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            const wakeUpManager = new WakeUpManager(nativeBridge, new FocusManager(nativeBridge));
            request = new Request(nativeBridge, wakeUpManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            cache = new Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping(nativeBridge), programmaticTrackingService);
        });

        it('should not reinit with development webview', () => {
            const reinitManager = new ReinitManager(nativeBridge, TestHelper.getClientInfo(null), request, cache);

            return reinitManager.shouldReinitialize().then(reinit => {
                assert.isFalse(reinit, 'development webview should not reinitialize');
            });
        });

        it('should not reinit immediately after constructing', () => {
            const reinitManager = new ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);

            return reinitManager.shouldReinitialize().then(reinit => {
                assert.isFalse(reinit, 'tried to reinitialize right after constructing webview');
            });
        });

        it('should reinit', () => {
            const reinitManager = new ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);

            const response: INativeResponse = {
                url: 'http://example.com/config.json',
                response: '{"url":"https://webview.unityads.unity3d.com/webview/2.2.0/c7ed12d4ad4b37cc82046d9fac763deb2e909049/release/index.html","hash":"3b58bd6f9dbba6a4944e508d1d5c1f8efdd5748a48df2eb4bb5ea8392a20e0de","version":"c7ed12d4ad4b37cc82046d9fac763deb2e909049"}',
                responseCode: 200,
                headers: []
            };
            sinon.stub(request, 'get').returns(Promise.resolve(response));
            const twentyMinutesInFuture: number = Date.now() + 20 * 60 * 1000;
            const now = sinon.stub(Date, 'now').returns(twentyMinutesInFuture);

            return reinitManager.shouldReinitialize().then(reinit => {
                now.restore();
                assert.isTrue(reinit, 'did not reinitialize after new hash');
            });
        });

        it('should not reinit when network fails', () => {
            const reinitManager = new ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);

            sinon.stub(request, 'get').returns(Promise.reject(new Error()));
            const twentyMinutesInFuture: number = Date.now() + 20 * 60 * 1000;
            const now = sinon.stub(Date, 'now').returns(twentyMinutesInFuture);

            return reinitManager.shouldReinitialize().then(reinit => {
                now.restore();
                assert.isFalse(reinit, 'tried to reinitialize with network error');
            });
        });
    });
});
