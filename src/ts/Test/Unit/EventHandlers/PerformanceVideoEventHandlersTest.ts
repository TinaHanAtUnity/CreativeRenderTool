import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandler } from 'EventHandlers/PerformanceVideoEventHandler';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { VideoState } from 'AdUnits/VideoAdUnit';
import { Privacy } from 'Views/Privacy';
import { GdprManager } from 'Managers/GdprManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { ForceQuitManager } from 'Managers/ForceQuitManager';

describe('PerformanceVideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: PerformanceEndScreen;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let performanceVideoEventHandler: PerformanceVideoEventHandler;
    let forceQuitManager: ForceQuitManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        forceQuitManager = sinon.createStubInstance(ForceQuitManager);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
        video = new Video('', TestFixtures.getSession());

        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo();
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request);
        const campaign = TestFixtures.getCampaign();
        const configuration = TestFixtures.getConfiguration();
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
        endScreen = new PerformanceEndScreen(nativeBridge, campaign, deviceInfo.getLanguage(), clientInfo.getGameId(), privacy, false);
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

        const videoEventHandlerParams: IVideoEventHandlerParams = {
            nativeBrige: nativeBridge,
            adUnit: performanceAdUnit,
            campaign: campaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            configuration: configuration,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };

        performanceVideoEventHandler = new PerformanceVideoEventHandler(<IVideoEventHandlerParams<PerformanceAdUnit, PerformanceCampaign>>videoEventHandlerParams);
    });

    describe('with onVideoCompleted', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            performanceVideoEventHandler.onCompleted(video.getUrl());
            sinon.assert.called(<sinon.SinonSpy>endScreen.show);
        });
    });

    describe('with onVideoError', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            // Set prepare called so that error will trigger
            performanceAdUnit.setVideoState(VideoState.PREPARING);
            // Cause an error by giving too large duration
            performanceVideoEventHandler.onPrepared(video.getUrl(), 50000, 1024, 768);
            sinon.assert.called(<sinon.SinonSpy>endScreen.show);
        });
    });
});
