import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { EventManager } from 'Managers/EventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';

describe('OverlayEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;
    let endScreen: EndScreen;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        endScreen = <EndScreen><any> {
            hide: sinon.spy(),
        };

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager))), metaDataManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        video = new Video('');
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), <PerformanceCampaign><any>{
            getVast: sinon.spy(),
            getVideo: () => video,
            getStreamingVideo: () => video,
            getSession: () => TestFixtures.getSession()
        }, video, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(sessionManager, 'sendSkip');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.spy(container, 'reconfigure');

            OverlayEventHandlers.onSkip(nativeBridge, sessionManager, performanceAdUnit);
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
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendSkip, performanceAdUnit, performanceAdUnit.getVideo().getPosition());
        });

        it('should call reconfigure', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
        });

        it('should hide overlay', () => {
            const overlay = performanceAdUnit.getOverlay();
            if(overlay) {
                sinon.assert.called(<sinon.SinonSpy>overlay.hide);
            }
        });

    });

    describe('When calling onMute', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
            sinon.stub(sessionManager, 'getSession').returns({getId: sinon.spy()});
        });

        it('should set volume to zero when muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, true);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should set volume to 1 when not muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, false);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });
    });

});
