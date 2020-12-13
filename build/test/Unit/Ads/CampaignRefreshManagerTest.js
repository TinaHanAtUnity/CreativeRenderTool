import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager, CacheStatus } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { Performance } from 'Performance/Performance';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
export class TestContainer extends AdUnitContainer {
    open(adUnit, views, allowRotation, forceOrientation, disableBackbutton, options) {
        return Promise.resolve();
    }
    close() {
        return Promise.resolve();
    }
    reconfigure(configuration) {
        return Promise.all([]);
    }
    reorient(allowRotation, forceOrientation) {
        return Promise.resolve(void 0);
    }
    isPaused() {
        return false;
    }
    setViewFrame(view, x, y, width, height) {
        return Promise.resolve();
    }
    getViews() {
        return Promise.all([]);
    }
}
export class TestAdUnit extends AbstractAdUnit {
    show() {
        return Promise.resolve();
    }
    hide() {
        return Promise.resolve();
    }
    description() {
        return 'TestAdUnit';
    }
    isShowing() {
        return true;
    }
    isCached() {
        return false;
    }
}
describe('CampaignRefreshManager', () => {
    let deviceInfo;
    let clientInfo;
    let vastParser;
    let coreConfig;
    let adsConfig;
    let campaignManager;
    let wakeUpManager;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let coreModule;
    let adsModule;
    let ads;
    let ar;
    let store;
    let request;
    let storageBridge;
    let assetManager;
    let sessionManager;
    let thirdPartyEventManager;
    let container;
    let campaignRefreshManager;
    let metaDataManager;
    let focusManager;
    let adUnitParams;
    let operativeEventManager;
    let adMobSignalFactory;
    let cacheBookkeeping;
    let cache;
    let privacyManager;
    let placementManager;
    let campaignParserManager;
    let privacy;
    let privacySDK;
    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        vastParser = TestFixtures.getVastParserStrict();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        coreModule = TestFixtures.getCoreModule(nativeBridge);
        core = coreModule.Api;
        adsModule = TestFixtures.getAdsModule(coreModule);
        coreModule.Ads = adsModule;
        ads = adsModule.Api;
        ar = TestFixtures.getARApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        privacy = sinon.createStubInstance(AbstractPrivacy);
        privacySDK = sinon.createStubInstance(PrivacySDK);
        storageBridge = new StorageBridge(core);
        placementManager = sinon.createStubInstance(PlacementManager);
        focusManager = new FocusManager(platform, core);
        metaDataManager = new MetaDataManager(core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        cacheBookkeeping = new CacheBookkeepingManager(core);
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sinon.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
        cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        campaignParserManager = new ContentTypeHandlerManager();
        assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        container = new TestContainer();
        const campaign = TestFixtures.getCampaign();
        const aem = new AutomatedExperimentManager();
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: campaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        });
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        adMobSignalFactory.getAdRequestSignal.returns(Promise.resolve(new AdMobSignal()));
        adMobSignalFactory.getOptionalSignal.returns(Promise.resolve(new AdMobOptionalSignal()));
        const performance = new Performance(ar, coreModule, aem, adsModule);
        const contentTypeHandlerMap = performance.getContentTypeHandlerMap();
        for (const contentType in contentTypeHandlerMap) {
            if (contentTypeHandlerMap.hasOwnProperty(contentType)) {
                campaignParserManager.addHandler(contentType, contentTypeHandlerMap[contentType]);
            }
        }
        adUnitParams = {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            privacyManager: privacyManager,
            privacy: privacy,
            privacySDK: privacySDK
        };
        RefreshManager.ParsingErrorRefillDelayInSeconds = 0; // prevent tests from hanging due to long retry timeouts
    });
    describe('PLC campaigns', () => {
        beforeEach(() => {
            coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
            adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
            privacySDK = TestFixtures.getPrivacySDK(core);
            campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager);
            campaignRefreshManager = new CampaignRefreshManager(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);
        });
        it('get campaign should return undefined', () => {
            assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
        });
        it('get campaign should return a campaign (Performance)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof PerformanceCampaign);
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', TestFixtures.getCampaign(), undefined);
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof PerformanceCampaign);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
            });
        });
        it('get campaign should return a campaign (XPromo)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getXPromoCampaign(), undefined);
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof XPromoCampaign);
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', TestFixtures.getXPromoCampaign(), undefined);
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof XPromoCampaign);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
            });
        });
        it('get campaign should return a campaign (Vast)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCompanionStaticVastCampaign(), undefined);
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof VastCampaign);
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '12345');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', TestFixtures.getCompanionStaticVastCampaign(), undefined);
                assert.isDefined(campaignRefreshManager.getCampaign('video'));
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof VastCampaign);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
            });
        });
        it('get campaign should return a campaign (MRAID)', () => {
            const mraid = TestFixtures.getExtendedMRAIDCampaign();
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', mraid, undefined);
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof MRAIDCampaign);
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '58dec182f01b1c0cdef54f0f');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', mraid, undefined);
                assert.isDefined(campaignRefreshManager.getCampaign('video'));
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof MRAIDCampaign);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
            });
        });
        it('should not refresh', () => {
            let campaign = TestFixtures.getCampaign();
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign, undefined);
                campaign = TestFixtures.getExtendedMRAIDCampaign();
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                return campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                    assert.isDefined(tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.notEqual(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                    }
                    const tmpCampaign3 = campaignRefreshManager.getCampaign('premium');
                    assert.isDefined(tmpCampaign3);
                    if (tmpCampaign3) {
                        assert.equal(tmpCampaign3.getId(), '582bb5e352e4c4abd7fab850');
                    }
                    assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                });
            });
        });
        it('placement states should end up with NO_FILL', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                campaignManager.onNoFill.trigger('premium');
                return Promise.resolve();
            });
            assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);
            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.NO_FILL);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onNoFill.trigger('video');
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.NO_FILL);
            });
        });
        it('should invalidate campaigns', () => {
            const campaign = TestFixtures.getCampaign();
            const placement = adsConfig.getPlacement('premium');
            adUnitParams.campaign = campaign;
            adUnitParams.placement = placement;
            const currentAdUnit = new TestAdUnit(adUnitParams);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', TestFixtures.getCampaign(), undefined);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
                campaignRefreshManager.setCurrentAdUnit(currentAdUnit, placement);
                currentAdUnit.onStart.trigger();
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
            });
        });
        it('should set campaign status to ready after close', () => {
            let campaign = TestFixtures.getCampaign();
            const campaign2 = TestFixtures.getExtendedMRAIDCampaign();
            const placement = adsConfig.getPlacement('premium');
            adUnitParams.campaign = campaign;
            adUnitParams.placement = placement;
            const currentAdUnit = new TestAdUnit(adUnitParams);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign, undefined);
                campaign = campaign2;
                return Promise.resolve();
            });
            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                campaignManager.onCampaign.trigger('video', campaign, undefined);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
                campaignRefreshManager.setCurrentAdUnit(currentAdUnit, placement);
                currentAdUnit.onStart.trigger();
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
                return campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                    assert.isDefined(tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.equal(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                    }
                    assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.WAITING);
                    assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                    currentAdUnit.onClose.trigger();
                    assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.WAITING);
                    campaignManager.onCampaign.trigger('video', campaign, undefined);
                    currentAdUnit.onClose.trigger();
                    assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.READY);
                });
            });
        });
        it('campaign error should set no fill', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                const error = new Error('TestErrorMessage');
                error.name = 'TestErrorMessage';
                error.stack = 'TestErrorStack';
                campaignManager.onError.trigger(error, ['premium', 'video'], 'test_diagnostics_type', undefined);
                return Promise.resolve();
            });
            assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);
            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.NO_FILL);
                assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.NO_FILL);
            });
        });
        xit('should send diagnostics when campaign caching fails', () => {
            sinon.stub(assetManager, 'setup').callsFake(() => {
                throw CacheStatus.FAILED;
            });
            let receivedErrorType;
            let receivedError;
            const diagnosticsStub = sinon.stub(SessionDiagnostics, 'trigger').callsFake((type, error) => {
                receivedErrorType = type;
                receivedError = error;
            });
            sinon.stub(request, 'post').callsFake(() => {
                return Promise.resolve({
                    response: JSON.stringify(OnCometVideoPlcCampaign),
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });
            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType, 'campaign_caching_failed', 'Incorrect error type');
            });
        });
        it('should send diagnostics when campaign request fails', () => {
            let receivedErrorType;
            let receivedError;
            const diagnosticsStub = sinon.stub(Diagnostics, 'trigger').callsFake((type, error) => {
                receivedErrorType = type;
                receivedError = error;
            });
            sinon.stub(request, 'post').callsFake(() => {
                return Promise.reject(new Error('test error'));
            });
            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType, 'auction_request_failed', 'Incorrect error type');
                assert.equal(receivedError.error.message, 'test error', 'Incorrect error message');
            });
        });
        xit('should send diagnostics when campaign response content type is wrong', () => {
            let receivedErrorType;
            let receivedError;
            const diagnosticsStub = sinon.stub(SessionDiagnostics, 'trigger').callsFake((type, error) => {
                receivedErrorType = type;
                receivedError = error;
            });
            sinon.stub(request, 'post').callsFake(() => {
                // TODO remove this garbage due to modifying imported json state
                const json = JSON.parse(JSON.stringify(OnCometVideoPlcCampaign));
                json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 'wrong/contentType';
                return Promise.resolve({
                    response: JSON.stringify(json),
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });
            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType, 'parse_campaign_wrong_contentType_error', 'Incorrect error type');
                assert.equal(receivedError.error.message, 'Unsupported content-type: wrong/contentType', 'Incorrect error message');
            });
        });
        xit('should send diagnostics when campaign response parsing fails because of wrong types', () => {
            let receivedErrorType;
            let receivedError;
            const diagnosticsStub = sinon.stub(SessionDiagnostics, 'trigger').callsFake((type, error) => {
                receivedErrorType = type;
                receivedError = error;
            });
            sinon.stub(request, 'post').callsFake(() => {
                // TODO remove this garbage due to modifying imported json state
                const json = JSON.parse(JSON.stringify(OnCometVideoPlcCampaign));
                json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 1;
                return Promise.resolve({
                    response: JSON.stringify(json),
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });
            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType, 'error_creating_handle_campaign_chain', 'Incorrect error type');
                assert.equal(receivedError.error.message, 'model: AuctionResponse key: contentType with value: 1: integer is not in: string', 'Incorrect error message');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25SZWZyZXNoTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL0NhbXBhaWduUmVmcmVzaE1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxlQUFlLEVBQVcsV0FBVyxFQUFxQixNQUFNLHdDQUF3QyxDQUFDO0FBRWxILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUU3RSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRzdFLE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsc0JBQXNC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