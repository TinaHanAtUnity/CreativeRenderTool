import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Cache } from 'Utilities/Cache';
import { ReinitManager } from 'Managers/ReinitManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';
import { StorageApi } from 'Native/Api/Storage';

describe('ReinitManagerTest', () => {
    describe('reinitialize', () => {
        let nativeBridge: NativeBridge;
        let clientInfo: ClientInfo;
        let request: Request;
        let cache: Cache;
        let reinitManager: ReinitManager;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            nativeBridge.Storage = new StorageApi(nativeBridge);
            clientInfo = TestFixtures.getClientInfo();
            const wakeUpManager = new WakeUpManager(nativeBridge, new FocusManager(nativeBridge));
            request = new Request(nativeBridge, wakeUpManager);
            cache = new Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping(nativeBridge));
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
        let clientInfo: ClientInfo;
        let request: Request;
        let cache: Cache;
        let reinitManager: ReinitManager;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            nativeBridge.Storage = new StorageApi(nativeBridge);
            clientInfo = TestFixtures.getClientInfo();
            const wakeUpManager = new WakeUpManager(nativeBridge, new FocusManager(nativeBridge));
            request = new Request(nativeBridge, wakeUpManager);
            cache = new Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping(nativeBridge));
            reinitManager = new ReinitManager(nativeBridge, clientInfo, request, cache);
        });

        it('should not reinit with development webview', () => {
            return reinitManager.shouldReinitialize().then(reinit => {
                assert.isFalse(reinit, 'development webview should not reinitialize');
            });
        });
    });
});
