import { AssetManager } from 'Ads/Managers/AssetManager';
import { HTML } from 'Ads/Models/Assets/HTML';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CacheManager, CacheStatus } from 'Core/Managers/CacheManager';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { Platform } from '../../src/ts/Core/Constants/Platform';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { IAdsApi } from '../../src/ts/Ads/IAds';
import { Campaign, ICampaign } from '../../src/ts/Ads/Models/Campaign';
import { Asset } from '../../src/ts/Ads/Models/Assets/Asset';

class TestCampaign extends Campaign {

    private _required: Asset[];
    private _optional: Asset[];

    constructor(required: Asset[], optional: Asset[]) {
        super('TestCampaign', Campaign.Schema, <ICampaign>{});
        this._required = required;
        this._optional = optional;
    }

    public getRequiredAssets() {
        return this._required;
    }

    public getOptionalAssets() {
        return this._optional;
    }

    public isConnectionNeeded() {
        return false;
    }
}

describe('AssetManagerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let wakeUpManager: WakeUpManager;
    let request: RequestManager;
    let deviceInfo: DeviceInfo;
    let focusManager: FocusManager;
    let cacheBookkeeping: CacheBookkeepingManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let backupCampaignManager: BackupCampaignManager;

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
        cacheBookkeeping = new CacheBookkeepingManager(core);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        backupCampaignManager = new BackupCampaignManager(core, TestFixtures.getCoreConfiguration());
    });

    it('should not cache anything when cache mode is disabled', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
        });
    });

    it('should cache required assets', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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

    it('should not wait for optional assets when cache mode is allowed', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(platform, core, cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should swallow optional errors when cache mode is allowed', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping, {retries: 0, retryDelay: 1});
        const assetManager = new AssetManager(platform, core, cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        backend.Api.Cache.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should not swallow errors when cache mode is forced', () => {
        const cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping, {retries: 0, retryDelay: 1});
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
        const assetManager = new AssetManager(platform, core, cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
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
