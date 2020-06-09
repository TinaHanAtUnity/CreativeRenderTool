import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';

import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IStoreHandler, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { Campaign } from 'Ads/Models/Campaign';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IStoreApi } from 'Store/IStore';
import { PrivacySDK } from 'Privacy/PrivacySDK';

describe('EndScreenEventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let container: AdUnitContainer;
    let overlay: VideoOverlay;
    let endScreen: PerformanceEndScreen;
    let storageBridge: StorageBridge;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let endScreenEventHandler: PerformanceEndScreenEventHandler;
    let campaign: PerformanceCampaign;
    let placement: Placement;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let storeHandler: IStoreHandler;
    let privacySDK: PrivacySDK;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

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
            sinon.spy(core.Android!.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());
            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            const endScreenParams: IEndScreenParameters = {
                platform,
                core,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: TestFixtures.getCampaign().getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, TestFixtures.getCampaign());
            placement = TestFixtures.getPlacement();

            const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
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

            const storeHandlerParameters: IStoreHandlerParameters = {
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
            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: 'landscape',
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo()
            };
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
        });

        describe('with store type standalone_android and appDownloadUrl', () => {
            const sandbox = sinon.createSandbox();
            const apkCampaign = TestFixtures.getCampaignStandaloneAndroid();

            const downloadParameters = <IEndScreenDownloadParameters>{
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

                    const storeHandlerParameters: IStoreHandlerParameters = {
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
                    sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent);
                });
            });

            it('should call click attribution if clickAttributionUrl is present', () => {
                sandbox.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();

                endScreenEventHandler.onEndScreenDownload(downloadParameters);

                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent);
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

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
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
                    (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                    sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Android!.Intent.launch);
                    });
                });
            });
        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.GOOGLE);
                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });

            it('should send a click with session manager', () => {
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });

            it('should launch market view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=com.iUnity.angryBots'
                });
            });
        });

    });

    describe('with onDownloadIos', () => {
        let resolvedPromise: Promise<INativeResponse>;

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

            sinon.spy(core.iOS!.UrlScheme, 'open');

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
            const endScreenParams: IEndScreenParameters = {
                platform,
                core,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: campaign.getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, campaign);

            placement = TestFixtures.getPlacement();
            const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
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

            const storeHandlerParameters: IStoreHandlerParameters = {
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

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
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

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'appstore://foobar.com');
                    });
                });
            });

            it('with response that does not contain location, it should not call open', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>core.iOS!.UrlScheme.open);
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

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });

            it('should launch app store view', () => {
                sinon.assert.called(<sinon.SinonSpy>core.iOS!.UrlScheme.open);
                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
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

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('open app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');

                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(store.iOS!.AppSheet, 'canOpen').returns(Promise.resolve(true));

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: '11111',
                    bypassAppSheet: false,
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });

            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(store.iOS!.AppSheet, 'present').returns(resolved);
                sinon.spy(store.iOS!.AppSheet, 'destroy');

                return new Promise((resolve, reject) => setTimeout(resolve, 500)).then(() => {
                    sinon.assert.called(<sinon.SinonSpy>store.iOS!.AppSheet.present);
                    sinon.assert.calledWith(<sinon.SinonSpy>store.iOS!.AppSheet.present, { id: 11111 });
                    sinon.assert.called(<sinon.SinonSpy>store.iOS!.AppSheet.destroy);
                });
            });

            it('should send a click with session manager', () => {
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });
        });
    });
});
