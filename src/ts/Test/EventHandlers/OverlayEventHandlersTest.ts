import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
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
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

describe('OverlayEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let sessionManager: SessionManager;
    let endScreen: EndScreen;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        endScreen = <EndScreen><any> {
            hide: sinon.spy(),
        };

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        let videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, <Overlay><any>{hide: sinon.spy()}, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);

    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(sessionManager, 'sendSkip');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');

            OverlayEventHandlers.onSkip(nativeBridge, sessionManager, performanceAdUnit);
        });

        it('should pause video player', () => {
            sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(performanceAdUnit.getVideoAdUnitController().isVideoActive());
        });

        it('should set finish state', () => {
            assert.equal(performanceAdUnit.getVideoAdUnitController().getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendSkip, performanceAdUnit, performanceAdUnit.getVideoAdUnitController().getVideoPosition());
        });

        it('should set views through AdUnit API', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.AndroidAdUnit.setViews, ['webview']);
        });

        it('should hide overlay', () => {
            const overlay = performanceAdUnit.getVideoAdUnitController().getOverlay();
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
