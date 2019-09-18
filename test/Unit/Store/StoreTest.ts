import 'mocha';
import { assert } from 'chai';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Store } from 'Store/Store';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import * as sinon from 'sinon';

describe('StoreTest', () => {
    let nativeBridge: NativeBridge;
    let core: ICore;

    describe('AppleStoreManager', () => {

        const sandbox = sinon.createSandbox();

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, TestFixtures.getBackend(Platform.IOS));
            core = TestFixtures.getCoreModule(nativeBridge);
            core.Ads = TestFixtures.getAdsModule(core);
            sandbox.stub(IosUtils, 'isStoreApiBroken').returns(false);
        });

        it('should create an AppleStoreManger', () => {
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, AppleStoreManager);
        });
    });

    describe('GoogleStoreManager', () => {

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
            core = TestFixtures.getCoreModule(nativeBridge);
            core.Ads = TestFixtures.getAdsModule(core);
        });

        it('should create a GoogleStoreManager', () => {
            const store = new Store(core, core.Ads.Analytics.AnalyticsManager);
            assert.instanceOf(store.StoreManager, GoogleStoreManager);
        });
    });

});
