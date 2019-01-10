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
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { NewVideoOverlay, IVideoOverlayParameters } from 'Ads/Views/NewVideoOverlay';
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
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { IStoreHandler, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandler/StoreHandlerFactory';
import { Campaign } from 'Ads/Models/Campaign';

describe('EndScreenEventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let container: AdUnitContainer;
    let overlay: NewVideoOverlay;
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

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);

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
                playerMetadataServerId: 'test-gamerSid'
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(core.Android!.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, campaign, privacyManager, false, false);
            const endScreenParams : IEndScreenParameters = {
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
            overlay = new NewVideoOverlay(videoOverlayParameters, privacy, false, false);
            const programmticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            performanceAdUnitParameters = {
                platform,
                core,
                ads,
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
                programmaticTrackingService: programmticTrackingService
            };

            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

            const storeHandlerParameters: IStoreHandlerParameters = {
                platform,
                core,
                ads,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
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

        describe('with standalone_android store type and appDownloadUrl', () => {
            let downloadParameters: IEndScreenDownloadParameters;

            beforeEach(() => {
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignStandaloneAndroid();
                performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

                downloadParameters = <IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gameId: performanceAdUnitParameters.campaign.getGameId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl(),
                    appDownloadUrl: performanceAdUnitParameters.campaign.getAppDownloadUrl()
                };
            });

            it('should call click attribution if clickAttributionUrl is present', () => {
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();

                endScreenEventHandler.onEndScreenDownload(downloadParameters);

                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent);
                });
            });

            it('it should launch view intent', () => {
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();

                endScreenEventHandler.onEndScreenDownload(downloadParameters);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': performanceAdUnitParameters.campaign.getAppDownloadUrl()
                    });
                });
            });
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
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

            it('with response that does not contain location, it should not launch intent', () => {
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
                playerMetadataServerId: 'test-gamerSid'
            });

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, campaign, privacyManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
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
            overlay = new NewVideoOverlay(videoOverlayParameters, privacy, false, false);
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            performanceAdUnitParameters = {
                platform,
                core,
                ads,
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
                programmaticTrackingService: programmaticTrackingService
            };

            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

            const storeHandlerParameters: IStoreHandlerParameters = {
                platform,
                core,
                ads,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
        });

        it('should send a click with session manager', () => {
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
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

        describe('with follow redirects', () => {
            it('with response that contains location, it should open url scheme', () => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
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

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('open app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(ads.iOS!.AppSheet, 'canOpen').returns(Promise.resolve(true));

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });

            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(ads.iOS!.AppSheet, 'present').returns(resolved);
                sinon.spy(ads.iOS!.AppSheet, 'destroy');

                return new Promise((resolve, reject) => setTimeout(resolve, 500)).then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>ads.iOS!.AppSheet.present, {id: 11111});
                    sinon.assert.called(<sinon.SinonSpy>ads.iOS!.AppSheet.destroy);
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
