import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';

import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Overlay } from 'Ads/Views/Overlay';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { StoreName, XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('XPromoEndScreenEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let overlay: Overlay;
    let endScreen: XPromoEndScreen;
    let storageBridge: StorageBridge;
    let sessionManager: SessionManager;
    let xPromoAdUnit: XPromoAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: XPromoOperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let xPromoAdUnitParameters: IXPromoAdUnitParameters;
    let endScreenEventHandler: XPromoEndScreenEventHandler;
    let campaign: XPromoCampaign;
    let placement: Placement;
    let programmaticTrackingService: ProgrammaticTrackingService;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            storageBridge = new StorageBridge(nativeBridge);
            campaign = TestFixtures.getXPromoCampaign();
            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            metaDataManager = new MetaDataManager(nativeBridge);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            operativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);

            sinon.spy(nativeBridge.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());
            const gdprManager = sinon.createStubInstance(GdprManager);
            const privacy = new Privacy(nativeBridge, campaign, gdprManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
                nativeBridge: nativeBridge,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: TestFixtures.getXPromoCampaign().getGameName()
            };
            endScreen = new XPromoEndScreen(endScreenParams, TestFixtures.getXPromoCampaign());
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
            placement = TestFixtures.getPlacement();

            xPromoAdUnitParameters = {
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
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            endScreenEventHandler = new XPromoEndScreenEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
        });

        it('should send a click to HttpKafka', () => {
            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });

            const params: IOperativeEventParams = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };

            sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendClick);
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
        });

    });

    describe('with onDownloadIos', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.IOS);

            storageBridge = new StorageBridge(nativeBridge);

            campaign = TestFixtures.getXPromoCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');

            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, clientInfo);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            deviceInfo = TestFixtures.getIosDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            operativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            const video = new Video('', TestFixtures.getSession());
            const gdprManager = sinon.createStubInstance(GdprManager);
            const privacy = new Privacy(nativeBridge, campaign, gdprManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
                nativeBridge: nativeBridge,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: campaign.getGameName()
            };
            endScreen = new XPromoEndScreen(endScreenParams, campaign);
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);

            xPromoAdUnitParameters = {
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
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            endScreenEventHandler = new XPromoEndScreenEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
        });

        it('should send a click to HttpKafka', () => {
            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                store: xPromoAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
            });

            const params: IOperativeEventParams = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };

            sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendClick);
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
        });
    });
});
