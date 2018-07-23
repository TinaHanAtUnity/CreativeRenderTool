import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandler } from 'EventHandlers/PerformanceOverlayEventHandler';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { Privacy } from 'Views/Privacy';
import { GdprManager } from 'Managers/GdprManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { ABGroupBuilder } from 'Models/ABGroup';
import { IEndScreenParameters } from 'Views/EndScreen';

describe('PerformanceOverlayEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let overlay: Overlay;
    let endScreen: PerformanceEndScreen;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let performanceOverlayEventHandler: PerformanceOverlayEventHandler;
    let request: Request;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        const campaign = TestFixtures.getCampaign();
        const configuration = TestFixtures.getConfiguration();
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        video = new Video('', TestFixtures.getSession());
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });

        const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
        const endScreenParams : IEndScreenParameters = {
            nativeBridge: nativeBridge,
            language : deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: true,
            abGroup: ABGroupBuilder.getAbGroup(99),
            targetGameName: campaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, campaign);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        performanceAdUnitParameters = {
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

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
    });

    describe('with onSkip', () => {
        it('should show end screen', () => {
            assert.isDefined(endScreen, 'endScreen not defined');
            sinon.spy(endScreen, 'show');
            performanceOverlayEventHandler.onOverlaySkip(1);

            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });

        it('should trigger onFinish', () => {
            const spy = sinon.spy(performanceAdUnit.onFinish, 'trigger');
            performanceOverlayEventHandler.onOverlaySkip(1);
            sinon.assert.called(spy);
        });
    });
});
