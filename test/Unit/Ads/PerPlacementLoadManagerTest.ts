import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager, ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { ILoadEvent, ILoadStorageEvent, PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PerPlacementLoadManagerTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let campaignManager: CampaignManager;
    let wakeUpManager: WakeUpManager;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let ads: IAdsApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let assetManager: AssetManager;
    let sessionManager: SessionManager;
    let loadManager: PerPlacementLoadManager;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let jaegerManager: JaegerManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let campaignParserManager: ContentTypeHandlerManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        clientInfo = TestFixtures.getClientInfo();
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core.Api);

        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        campaignParserManager = sinon.createStubInstance(ContentTypeHandlerManager);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        jaegerManager = sinon.createStubInstance(JaegerManager);

        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));

        storageBridge = new StorageBridge(core.Api);
        focusManager = new FocusManager(platform, core.Api);
        metaDataManager = new MetaDataManager(core.Api);
        wakeUpManager = new WakeUpManager(core.Api);
        request = new RequestManager(platform, core.Api, wakeUpManager);
        sessionManager = new SessionManager(core.Api, request, storageBridge);
        cacheBookkeeping = new CacheBookkeepingManager(core.Api);
        cache = new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping);
        assetManager = new AssetManager(platform, core.Api, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
        campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager);
        loadManager = new PerPlacementLoadManager(core.Api, ads, adsConfig, campaignManager, clientInfo, focusManager);
    });

    describe('getStoredLoads', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(core.Api.Storage, 'get');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should not call getStoredLoad at all', () => {
            sandbox.stub(core.Api.Storage, 'getKeys').returns(Promise.resolve([]));
            return loadManager.initialize().then((res) => {
                sandbox.assert.notCalled((<sinon.SinonStub>core.Api.Storage.get));
            });
        });

        it('should not call getStoredLoad at all', () => {
            sandbox.stub(core.Api.Storage, 'getKeys').returns(Promise.reject());
            return loadManager.initialize().then((res) => {
                sandbox.assert.notCalled((<sinon.SinonStub>core.Api.Storage.get));
            });
        });

        it('should ignore loads set more than 60 seconds prior to SDK initialization', () => {
            const time = Date.now();
            const loadEvent: ILoadEvent = {
                value: 'scott',
                ts: time - 600001
            };
            sandbox.stub(clientInfo, 'getInitTimestamp').returns(time);
            sandbox.stub(campaignManager, 'loadCampaign');
            sandbox.stub(core.Api.Storage, 'getKeys').returns(Promise.resolve({key: loadEvent}));
            return loadManager.initialize().then((res) => {
                sandbox.assert.notCalled((<sinon.SinonStub> campaignManager.loadCampaign));
            });
        });
    });

    describe('onStorageSet', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(core.Api.Storage, 'delete').callsFake(() => {
                return Promise.resolve();
            });
            sandbox.stub(core.Api.Storage, 'write').callsFake(() => {
                return Promise.resolve();
            });
            (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
            (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));
        });

        it('should correctly load placements and delete the load information onStorageSet', () => {
            const loadStorageEvent: ILoadStorageEvent = {
                load: {
                    'key': {
                        value: 'premium',
                        ts: clientInfo.getInitTimestamp()
                    }
                }
            };
            core.Api.Storage.onSet.trigger('type', loadStorageEvent);
            sinon.assert.called((<sinon.SinonStub>core.Api.Storage.delete));
            sinon.assert.called((<sinon.SinonStub>core.Api.Storage.write));
        });
    });

    describe('getCampaign and initialize', () => {
        describe('without loading placement IDs', () => {
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            adsConfig.getPlacementIds().forEach((placementId) => {
                it(`should return undefined with placementID '${placementId}' before campaigns are loaded`, () => {
                    assert.isUndefined(loadManager.getCampaign(placementId), `PlacementID '${placementId}' was defined prior to loading`);
                });
            });
        });

        describe('with loading placement IDs', () => {
            let placementId: string;
            let loadEvent: ILoadEvent;
            let sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                placementId = 'premium';
                loadEvent = {
                    value: placementId,
                    ts: clientInfo.getInitTimestamp() + 1
                };
                sandbox.stub(core.Api.Storage, 'get').callsFake(() => {
                    return Promise.resolve(loadEvent);
                });
                sandbox.stub(core.Api.Storage, 'getKeys').callsFake(() => {
                    return Promise.resolve(adsConfig.getPlacementIds());
                });
                // To silence diagnostic messages
                sandbox.stub(Diagnostics, 'trigger').callsFake(() => {
                    return Promise.resolve(<INativeResponse>{});
                });
            });

            afterEach(() => {
                sandbox.restore();
            });

            // The actual values don't matter, only that they are different campaigns
            const tests: {
                expectedCampaign: Campaign;
                unexpectedCampaign: Campaign;
            }[] = [{
                expectedCampaign: TestFixtures.getCampaign(),
                unexpectedCampaign: TestFixtures.getXPromoCampaign()
            }, {
                expectedCampaign: TestFixtures.getXPromoCampaign(),
                unexpectedCampaign: TestFixtures.getCampaign()
            }];

            tests.forEach((t) => {
                it('should load/overwrite the correct campaign', () => {
                    sandbox.stub(campaignManager, 'loadCampaign').callsFake(() => {
                        return Promise.resolve(<ILoadedCampaign>{
                            campaign: t.expectedCampaign,
                            trackingUrls: {}
                        });
                    });
                    return loadManager.initialize().then(() => {
                        const testCampaign = loadManager.getCampaign(placementId);
                        assert.instanceOf(testCampaign, Campaign, `Campaign with placementID '${placementId}' was not a defined Campaign`);
                        assert.equal(testCampaign, t.expectedCampaign, 'Loaded campaign was not the correct campaign');
                        assert.notEqual(testCampaign, t.unexpectedCampaign, 'Loaded campaign was not the correct campaign');
                        assert.isUndefined(loadManager.getCampaign('banner'), 'Campaign with placementID \'banner\' was loaded incorrectly');
                    });
                });
            });

            it('should set the placement state to nofill', () => {
                sandbox.stub(campaignManager, 'loadCampaign').callsFake(() => {
                    return Promise.resolve(undefined);
                });
                sandbox.stub(ads.Placement, 'setPlacementState');
                return loadManager.initialize().then(() => {
                    const testCampaign = loadManager.getCampaign(placementId);
                    assert.isUndefined(testCampaign, 'Loaded campaign was defined');
                    sinon.assert.calledWith((<sinon.SinonStub>ads.Placement.setPlacementState), placementId, PlacementState.NO_FILL);
                });
            });
        });
    });

    describe('setCurrentAdUnit', () => {
        it('should handle setting the current ad unit correctly', () => {
            const adUnit = sinon.createStubInstance(AbstractAdUnit);
            const placement = adsConfig.getPlacement('premium');
            placement.setState(PlacementState.READY);
            loadManager.setCurrentAdUnit(adUnit, placement);
            assert.isUndefined(placement.getCurrentCampaign());
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE);
        });
    });

    describe('refresh', () => {
        let placement: Placement;
        let campaign: Campaign;

        beforeEach(() => {
            placement = adsConfig.getPlacement('premium');
            campaign = TestFixtures.getCampaign();
            placement.setState(PlacementState.READY);
        });

        it('should invalidate expired campaigns', () => {
            campaign.set('willExpireAt', Date.now() - 1);
            placement.setCurrentCampaign(campaign);

            return loadManager.refresh().then((resp) => {
                assert.isUndefined(resp, 'Promise should always resolve with undefined');
                assert.isUndefined(placement.getCurrentCampaign(), 'Campaign for placement should be set to undefined');
                assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'Placement State should be not available');
            });
        });

        it('should not invalidate campaigns which haven\'t expired', () => {
            campaign.set('willExpireAt', Date.now() + 100);
            placement.setCurrentCampaign(campaign);

            return loadManager.refresh().then((resp) => {
                assert.isUndefined(resp, 'Promise should always resolve with undefined');
                assert.equal(placement.getCurrentCampaign(), campaign, 'Campaign for placement should be set to undefined');
                assert.equal(placement.getState(), PlacementState.READY, 'Placement State should be not available');
            });
        });
    });

    describe('shouldRefill', () => {
        it('should always return false', () => {
            const unusedTimestamp = 0;
            assert.isFalse(loadManager.shouldRefill(unusedTimestamp));
        });
    });

    describe('setPlacementState and setPlacementStateChanges', () => {
        let placement: Placement;
        let sandbox: sinon.SinonSandbox;
        const placementID = 'premium';

        beforeEach(() => {
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            sandbox = sinon.createSandbox();
            sandbox.stub(ads.Listener, 'sendReadyEvent');
            sandbox.stub(ads.Placement, 'setPlacementState');
            sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should overwrite the placement state to ready', () => {
            loadManager.setPlacementState(placementID, PlacementState.READY);
            assert.isFalse(placement.getPlacementStateChanged(), 'placement state should not be unchanged after this point');
            sandbox.assert.called((<sinon.SinonStub>ads.Listener.sendReadyEvent));
            sandbox.assert.called((<sinon.SinonStub>ads.Placement.setPlacementState));
            sandbox.assert.called((<sinon.SinonStub>ads.Listener.sendPlacementStateChangedEvent));
        });

        it('should not overwrite the placement state', () => {
            loadManager.setPlacementState(placementID, PlacementState.NOT_AVAILABLE);
            assert.isUndefined(placement.getPlacementStateChanged(), 'getPlacementStateChanged should not be defined at this point');
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Listener.sendReadyEvent));
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Placement.setPlacementState));
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Listener.sendPlacementStateChangedEvent));
        });
    });
});
