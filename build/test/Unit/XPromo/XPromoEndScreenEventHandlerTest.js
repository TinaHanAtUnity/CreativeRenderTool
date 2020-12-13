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
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { StoreName } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('XPromoEndScreenEventHandlerTest', () => {
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
    let xPromoAdUnit;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let xPromoAdUnitParameters;
    let endScreenEventHandler;
    let campaign;
    let placement;
    afterEach(() => {
        xPromoAdUnit.setShowing(true);
        return xPromoAdUnit.hide();
    });
    describe('with onDownloadAndroid', () => {
        let resolvedPromise;
        let storeHandler;
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getXPromoCampaign();
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            focusManager = new FocusManager(platform, core);
            metaDataManager = new MetaDataManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
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
                userPrivacyManager: userPrivacyManager
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
            sinon.spy(core.Android.Intent, 'launch');
            const video = new Video('', TestFixtures.getSession());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, campaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
            const endScreenParams = {
                platform,
                core,
                language: deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: TestFixtures.getXPromoCampaign().getGameName()
            };
            endScreen = new XPromoEndScreen(endScreenParams, TestFixtures.getXPromoCampaign());
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
            xPromoAdUnitParameters = {
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
            xPromoAdUnit = new XPromoAdUnit(xPromoAdUnitParameters);
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
                adUnit: xPromoAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new XPromoEndScreenEventHandler(xPromoAdUnit, xPromoAdUnitParameters, storeHandler);
        });
        it('should call onDownload on StoreHandler', () => {
            sinon.spy(storeHandler, 'onDownload');
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });
            sinon.assert.called(storeHandler.onDownload);
        });
        it('should send a click to HttpKafka', () => {
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });
            const params = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };
            sinon.assert.called(operativeEventManager.sendClick);
            sinon.assert.calledWith(operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
        });
        it('should send a xpromo click', () => {
            const trackingUrl = 'http://fake-tracking-url.unity3d.com/';
            sinon.spy(thirdPartyEventManager, 'sendWithGet');
            sinon.stub(campaign, 'getTrackingUrlsForEvent').returns([trackingUrl]);
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });
            sinon.assert.called(thirdPartyEventManager.sendWithGet);
            sinon.assert.calledWith(thirdPartyEventManager.sendWithGet, 'xpromo click', campaign.getSession().getId(), trackingUrl);
        });
    });
    describe('with onDownloadIos', () => {
        let resolvedPromise;
        let storeHandler;
        beforeEach(() => {
            platform = Platform.IOS;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getXPromoCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');
            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            deviceInfo = TestFixtures.getIosDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
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
                userPrivacyManager: userPrivacyManager
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            const video = new Video('', TestFixtures.getSession());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
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
            endScreen = new XPromoEndScreen(endScreenParams, campaign);
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
            xPromoAdUnitParameters = {
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
                placement: TestFixtures.getPlacement(),
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
            xPromoAdUnit = new XPromoAdUnit(xPromoAdUnitParameters);
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
                adUnit: xPromoAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new XPromoEndScreenEventHandler(xPromoAdUnit, xPromoAdUnitParameters, storeHandler);
        });
        it('should call onDownload on StoreHandler', () => {
            sinon.spy(storeHandler, 'onDownload');
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });
            sinon.assert.called(storeHandler.onDownload);
        });
        it('should send a click to HttpKafka', () => {
            endScreenEventHandler.onEndScreenDownload({
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });
            const params = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };
            sinon.assert.called(operativeEventManager.sendClick);
            sinon.assert.calledWith(operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vRW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9YUHJvbW8vWFByb21vRW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFJdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUdoRCxPQUFPLEVBQUUsWUFBWSxFQUEyQixNQUFNLHdCQUF3QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQW1CLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUk1RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFP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