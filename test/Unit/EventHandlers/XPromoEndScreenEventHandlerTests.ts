import 'mocha';
import * as sinon from 'sinon';

import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from 'Helpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { XPromoCampaign, StoreName } from 'Models/Campaigns/XPromoCampaign';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { ClientInfo } from 'Models/ClientInfo';
import { XPromoEndScreen } from 'Views/XPromoEndScreen';
import { Placement } from 'Models/Placement';
import { XPromoEndScreenEventHandler } from 'EventHandlers/XPromoEndScreenEventHandler';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { Privacy } from 'Views/Privacy';
import { GdprManager } from 'Managers/GdprManager';
import { IOperativeEventParams } from 'Managers/OperativeEventManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Views/EndScreen';
import { ForceQuitManager } from 'Managers/ForceQuitManager';

describe('XPromoEndScreenEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer, overlay: Overlay, endScreen: XPromoEndScreen;
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
    let forceQuitManager: ForceQuitManager;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            campaign = TestFixtures.getXPromoCampaign();
            focusManager = new FocusManager(nativeBridge);
            forceQuitManager = sinon.createStubInstance(ForceQuitManager);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
            metaDataManager = new MetaDataManager(nativeBridge);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);
            const configuration = TestFixtures.getConfiguration();
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            operativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);

            sinon.spy(nativeBridge.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());
            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
                nativeBridge: nativeBridge,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: configuration.getAbGroup(),
                targetGameName: TestFixtures.getXPromoCampaign().getGameName()
            };
            endScreen = new XPromoEndScreen(endScreenParams, TestFixtures.getXPromoCampaign());
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
            placement = TestFixtures.getPlacement();
            const gdprManager = sinon.createStubInstance(GdprManager);

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
                configuration: configuration,
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

            campaign = TestFixtures.getXPromoCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');

            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, clientInfo, forceQuitManager);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            deviceInfo = TestFixtures.getIosDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);
            const configuration = TestFixtures.getConfiguration();
            operativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(operativeEventManager, 'sendClick');
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            const video = new Video('', TestFixtures.getSession());

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
                nativeBridge: nativeBridge,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: configuration.getAbGroup(),
                targetGameName: campaign.getGameName()
            };
            endScreen = new XPromoEndScreen(endScreenParams, campaign);
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
            const gdprManager = sinon.createStubInstance(GdprManager);

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
                configuration: configuration,
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
