import { AssetManager } from 'Ads/Managers/AssetManager';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Campaign } from 'Ads/Models/Campaign';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager, CacheStatus } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
class TestCampaign extends Campaign {
    constructor(required, optional) {
        super('TestCampaign', Campaign.Schema, {});
        this._required = required;
        this._optional = optional;
    }
    getRequiredAssets() {
        return this._required;
    }
    getOptionalAssets() {
        return this._optional;
    }
    isConnectionNeeded() {
        return false;
    }
}
describe('AssetManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let wakeUpManager;
    let request;
    let deviceInfo;
    let clientInfo;
    let focusManager;
    let cacheBookkeeping;
    let storageBridge;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        focusManager = new FocusManager(platform, core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        cacheBookkeeping = new CacheBookkeepingManager(core);
        storageBridge = new StorageBridge(core);
    });
    it('should not cache anything when cache mode is disabled', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
        });
    });
    it('should cache required assets', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(spy.called, 'Cache was not called for required asset');
            assert(asset.isCached(), 'Asset was not cached');
        });
    });
    it('should cache optional assets', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            return new Promise((resolve, reject) => { setTimeout(resolve, 300); }).then(() => {
                assert(spy.called, 'Cache was not called for optional asset');
                assert(asset.isCached(), 'Asset was not cached');
            });
        });
    });
    it('should cache optional assets when cache mode is overridden from Allowed to Forced', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        const spy = sinon.spy(cache, 'cache');
        assetManager.overrideCacheMode(CacheMode.FORCED);
        return assetManager.setup(campaign).then(() => {
            return new Promise((resolve, reject) => { setTimeout(resolve, 300); }).then(() => {
                assert(spy.called, 'Cache was not called for optional asset');
                assert(asset.isCached(), 'Asset was not cached');
            });
        });
    });
    it('should not wait for optional assets when cache mode is allowed', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });
    it('should swallow optional errors when cache mode is allowed', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping, { retries: 0, retryDelay: 1 });
        const assetManager = new AssetManager(platform, core, cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        backend.Api.Cache.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });
    it('should not swallow errors when cache mode is forced', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping, { retries: 0, retryDelay: 1 });
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        backend.Api.Cache.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            throw new Error('Should not resolve');
        }).catch(error => {
            assert.equal(error, CacheStatus.FAILED);
        });
    });
    it('should cache two campaigns', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const asset2 = new HTML('https:/www.google.fi/2', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const campaign2 = new TestCampaign([asset2], []);
        return Promise.all([assetManager.setup(campaign), assetManager.setup(campaign2)]).then(() => {
            assert(asset.isCached(), 'First asset was not cached');
            assert(asset2.isCached(), 'Second asset was not cached');
        });
    });
    it('should stop caching', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const promise = assetManager.setup(campaign);
        assetManager.stopCaching();
        return promise.then(() => {
            throw new Error('Should not resolve');
        }).catch(error => {
            assert.isFalse(asset.isCached(), 'Asset was cached when caching was stopped');
        });
    });
    it('should act like cache mode disabled when there is less than 20 MB of free space', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        backend.Api.Cache.setFreeSpace(0);
        return assetManager.checkFreeSpace().then(() => {
            return assetManager.setup(campaign);
        }).then(() => {
            assert(!spy.called, 'Cache was called when there is less than 20 MB of free space');
            assert(!asset.isCached(), 'Asset was cached when there is less than 20 MB of free space');
        });
    });
    it('should cache in a normal way when there is more than 20 MB of free space', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        backend.Api.Cache.setFreeSpace(123456789);
        return assetManager.checkFreeSpace().then(() => {
            return assetManager.setup(campaign);
        }).then(() => {
            assert(spy.called, 'Cache was not called with forced caching and more than 20 MB of free space');
            assert(asset.isCached(), 'Asset was not cached with forced caching and more than 20 MB of free space');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvQXNzZXRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFekQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBRSxRQUFRLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUcxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHeEQsTUFBTSxZQUFhLFNBQVEsUUFBUTtJQUsvQixZQUFZLFFBQWlCLEVBQUUsUUFBaUI7UUFDNUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxTQUFT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