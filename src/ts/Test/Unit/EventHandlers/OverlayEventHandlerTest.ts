import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { Placement } from 'Models/Placement';

describe('OverlayEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;
    let endScreen: PerformanceEndScreen;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let overlay: Overlay;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let overlayEventHandler: OverlayEventHandler<PerformanceCampaign>;
    let comScoreService: ComScoreTrackingService;
    let campaign: PerformanceCampaign;
    let placement: Placement;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();

        campaign = TestFixtures.getCampaign();
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        video = new Video('', TestFixtures.getSession());
        endScreen = new PerformanceEndScreen(nativeBridge, campaign, TestFixtures.getConfiguration().isCoppaCompliant(), deviceInfo.getLanguage(), clientInfo.getGameId());
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
        placement = TestFixtures.getPlacement();

        performanceAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: placement,
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video
        };
        sinon.stub(performanceAdUnitParameters.campaign, 'getAbGroup').returns(5);

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        overlayEventHandler = new OverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(operativeEventManager, 'sendSkip');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
            sinon.spy(comScoreService, 'sendEvent');

            overlayEventHandler.onOverlaySkip(1);
        });

        it('should pause video player', () => {
            sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finish state', () => {
            assert.equal(performanceAdUnit.getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendSkip, campaign.getSession(), placement, campaign, performanceAdUnit.getVideo().getPosition());
        });

        it('should call reconfigure', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
        });

        it('should hide overlay', () => {
            sinon.assert.called(<sinon.SinonSpy>overlay.hide);
        });

        it('should send comscore end event', () => {
            const positionAtSkip = performanceAdUnit.getVideo().getPosition();
            const comScoreDuration = (performanceAdUnit.getVideo().getDuration()).toString(10);
            const sessionId = campaign.getSession().getId();
            const creativeId = campaign.getCreativeId();
            const category =  campaign.getCategory();
            const subCategory = campaign.getSubCategory();
            sinon.assert.calledWith(<sinon.SinonSpy>comScoreService.sendEvent, 'end', sessionId, comScoreDuration, positionAtSkip, creativeId, category, subCategory);
        });
    });

    describe('When calling onMute', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
        });

        it('should set volume to zero when muted', () => {
            overlayEventHandler.onOverlayMute(true);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should set volume to 1 when not muted', () => {
            overlayEventHandler.onOverlayMute(false);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });
    });

});
