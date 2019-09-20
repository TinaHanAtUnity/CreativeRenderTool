import { IosUtils } from 'Ads/Utilities/IosUtils';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { NullStoreManager } from 'Store/Managers/NullStoreManager';
import { Store } from 'Store/Store';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';

describe('StoreTest', () => {
    let nativeBridge: NativeBridge;
    let core: ICore;

    describe('AppleStoreManager', () => {

        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, TestFixtures.getBackend(Platform.IOS));
            core = TestFixtures.getCoreModule(nativeBridge);
            core.Ads = TestFixtures.getAdsModule(core);
            core.Config = TestFixtures.getCoreConfiguration();
            core.Config.set('analytics', true);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should create an AppleStoreManger', () => {
            sandbox.stub(IosUtils, 'isStoreApiBroken').returns(false);
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, AppleStoreManager);
        });

        it('should create a NullStoreManager when isStoreApiBroken returns true', () => {
            sandbox.stub(IosUtils, 'isStoreApiBroken').returns(true);
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, NullStoreManager);
        });
    });

    describe('GoogleStoreManager', () => {

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
            core = TestFixtures.getCoreModule(nativeBridge);
            core.Ads = TestFixtures.getAdsModule(core);
            core.Config = TestFixtures.getCoreConfiguration();
            core.Config.set('analytics', true);
        });

        it('should create a GoogleStoreManager', () => {
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, GoogleStoreManager);
        });
    });

    describe('NullStoreManager', () => {

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
            core = TestFixtures.getCoreModule(nativeBridge);
            core.Ads = TestFixtures.getAdsModule(core);
            core.Config = TestFixtures.getCoreConfiguration();
        });

        it('should create a GoogleStoreManager', () => {
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, NullStoreManager);
        });
    });

});
