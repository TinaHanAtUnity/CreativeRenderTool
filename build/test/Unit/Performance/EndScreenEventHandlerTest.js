import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('EndScreenEventHandlerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let container;
    let overlay;
    let endScreen;
    let storageBridge;
    let sessionManager;
    let performanceAdUnit;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let performanceAdUnitParameters;
    let endScreenEventHandler;
    let campaign;
    let placement;
    let coreConfig;
    let adsConfig;
    let storeHandler;
    let privacySDK;
    describe('with onDownloadAndroid', () => {
        let resolvedPromise;
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getCampaign();
            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            metaDataManager = new MetaDataManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
            privacySDK = sinon.createStubInstance(PrivacySDK);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
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
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(core.Android.Intent, 'launch');
            const video = new Video('', TestFixtures.getSession());
            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            const endScreenParams = {
                platform,
                core,
                language: deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: TestFixtures.getCampaign().getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, TestFixtures.getCampaign());
            placement = TestFixtures.getPlacement();
            const videoOverlayParameters = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            performanceAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                privacyManager: privacyManager,
                privacySDK: privacySDK
            };
            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
            const storeHandlerParameters = {
                platform,
                core,
                ads,
                store,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
        });
        afterEach(() => {
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide();
        });
        it('should send a click with session manager', () => {
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });
            const params = { placement: placement,
                videoOrientation: 'landscape',
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo()
            };
            sinon.assert.calledWith(operativeEventManager.sendClick, params);
        });
        describe('with store type standalone_android and appDownloadUrl', () => {
            const sandbox = sinon.createSandbox();
            const apkCampaign = TestFixtures.getCampaignStandaloneAndroid();
            const downloadParameters = {
                appStoreId: apkCampaign.getAppStoreId(),
                bypassAppSheet: apkCampaign.getBypassAppSheet(),
                gameId: apkCampaign.getGameId(),
                store: apkCampaign.getStore(),
                clickAttributionUrlFollowsRedirects: true,
                clickAttributionUrl: apkCampaign.getClickAttributionUrl(),
                appDownloadUrl: apkCampaign.getAppDownloadUrl()
            };
            beforeEach(() => {
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = apkCampaign;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    const storeHandlerParameters = {
                        platform,
                        core,
                        ads,
                        store,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        placement: placement,
                        adUnit: performanceAdUnit,
                        campaign: apkCampaign
                    };
                    storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                    sandbox.stub(performanceAdUnit, 'hide').callsFake(() => {
                        performanceAdUnit.onClose.trigger();
                    });
                });
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should call click attribution if clickAttributionUrl is present', () => {
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();
                endScreenEventHandler.onEndScreenDownload(downloadParameters);
                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(thirdPartyEventManager.clickAttributionEvent);
                });
            });
            it('should call click attribution if clickAttributionUrl is present', () => {
                sandbox.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();
                endScreenEventHandler.onEndScreenDownload(downloadParameters);
                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(thirdPartyEventManager.clickAttributionEvent);
                });
            });
        });
        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                const overlayContainer = overlay.container();
                if (overlayContainer && overlayContainer.parentElement) {
                    overlayContainer.parentElement.removeChild(overlayContainer);
                }
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                        url: 'http://foo.url.com',
                        response: 'foo response',
                        responseCode: 200,
                        headers: [['location', 'market://foobar.com']]
                    }));
                    endScreenEventHandler.onEndScreenDownload({
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(core.Android.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'market://foobar.com'
                        });
                    });
                });
            });
            it('with response that does not contain location, it should not launch intent', () => {
                const overlayContainer = overlay.container();
                if (overlayContainer && overlayContainer.parentElement) {
                    overlayContainer.parentElement.removeChild(overlayContainer);
                }
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    const response = TestFixtures.getOkNativeResponse();
                    response.headers = [];
                    resolvedPromise = Promise.resolve(response);
                    operativeEventManager.sendClick.restore();
                    sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                    endScreenEventHandler.onEndScreenDownload({
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                    return resolvedPromise.then(() => {
                        sinon.assert.notCalled(core.Android.Intent.launch);
                    });
                });
            });
        });
        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.GOOGLE);
                endScreenEventHandler.onEndScreenDownload({
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });
            it('should send a click with session manager', () => {
                const params = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(operativeEventManager.sendClick, params);
            });
            it('should launch market view', () => {
                sinon.assert.calledWith(core.Android.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=com.iUnity.angryBots'
                });
            });
        });
    });
    describe('with onDownloadIos', () => {
        let resolvedPromise;
        beforeEach(() => {
            platform = Platform.IOS;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getCampaign();
            focusManager = new FocusManager(platform, core);
            container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
            metaDataManager = new MetaDataManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            deviceInfo = TestFixtures.getIosDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.spy(core.iOS.UrlScheme, 'open');
            const video = new Video('', TestFixtures.getSession());
            campaign = TestFixtures.getCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');
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
            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            const privacy = new Privacy(platform, campaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
            const endScreenParams = {
                platform,
                core,
                language: deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: campaign.getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, campaign);
            placement = TestFixtures.getPlacement();
            const videoOverlayParameters = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            performanceAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                privacyManager: privacyManager,
                privacySDK: privacySDK
            };
            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
            const storeHandlerParameters = {
                platform,
                core,
                ads,
                store,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
        });
        afterEach(() => {
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide();
        });
        it('should send a click with session manager', () => {
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide().then(() => {
                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                endScreenEventHandler.onEndScreenDownload({
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
                const params = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(operativeEventManager.sendClick, params);
            });
        });
        describe('with follow redirects', () => {
            it('with response that contains location, it should open url scheme', () => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                    campaign = TestFixtures.getCampaignFollowsRedirects();
                    campaign.set('store', StoreName.APPLE);
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                    sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                        url: 'http://foo.url.com',
                        response: 'foo response',
                        responseCode: 200,
                        headers: [['location', 'appstore://foobar.com']]
                    }));
                    endScreenEventHandler.onEndScreenDownload({
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(core.iOS.UrlScheme.open, 'appstore://foobar.com');
                    });
                });
            });
            it('with response that does not contain location, it should not call open', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                operativeEventManager.sendClick.restore();
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                endScreenEventHandler.onEndScreenDownload({
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(core.iOS.UrlScheme.open);
                });
            });
        });
        describe('with no follow redirects and OS version 8.1', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('8.1');
                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnitParameters.campaign = campaign;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                    endScreenEventHandler.onEndScreenDownload({
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });
            it('should launch app store view', () => {
                sinon.assert.called(core.iOS.UrlScheme.open);
                sinon.assert.calledWith(core.iOS.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });
        });
        describe('with no follow redirects and bypass app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(true);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnitParameters.campaign = campaign;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                    endScreenEventHandler.onEndScreenDownload({
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });
            it('should launch app store view', () => {
                sinon.assert.calledWith(core.iOS.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });
        });
        describe('open app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(store.iOS.AppSheet, 'canOpen').returns(Promise.resolve(true));
                endScreenEventHandler.onEndScreenDownload({
                    appStoreId: '11111',
                    bypassAppSheet: false,
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });
            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(store.iOS.AppSheet, 'present').returns(resolved);
                sinon.spy(store.iOS.AppSheet, 'destroy');
                return new Promise((resolve, reject) => setTimeout(resolve, 500)).then(() => {
                    sinon.assert.called(store.iOS.AppSheet.present);
                    sinon.assert.calledWith(store.iOS.AppSheet.present, { id: 11111 });
                    sinon.assert.called(store.iOS.AppSheet.destroy);
                });
            });
            it('should send a click with session manager', () => {
                const params = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(operativeEventManager.sendClick, params);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9QZXJmb3JtYW5jZS9FbmRTY3JlZW5FdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRCxPQUFPLEVBQW1CLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUl2RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFN0UsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR2hELE9BQU8sRUFBRSxZQUFZLEVBQTJCLE1BQU0sd0JBQXdCLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBbUIsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTTVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBZ0Ms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