import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { VideoAdUnit } from '../../src/ts/AdUnits/VideoAdUnit';
import { Campaign } from '../../src/ts/Models/Campaign';
import { SessionManager } from '../../src/ts/Managers/SessionManager';
import { OverlayEventHandlers } from '../../src/ts/EventHandlers/OverlayEventHandlers';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from '../../src/ts/Views/Overlay';
import { EndScreen } from '../../src/ts/Views/EndScreen';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { Request } from '../../src/ts/Utilities/Request';
import { FinishState } from '../../src/ts/Constants/FinishState';
import { Double } from '../../src/ts/Utilities/Double';

describe('OverlayEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, adUnit;
    let sessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(), new EventManager(nativeBridge, new Request(nativeBridge)));

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, <Overlay><any>{hide: sinon.spy()}, <EndScreen><any>{show: sinon.spy()});
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(sessionManager, 'sendSkip');
            sinon.spy(nativeBridge.AdUnit, 'setViews');

            OverlayEventHandlers.onSkip(nativeBridge, sessionManager, adUnit);
        });

        it('should pause video player', () => {
            sinon.assert.called(nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(adUnit.isVideoActive());
        });

        it('should set finish state', () => {
            assert.equal(adUnit.getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            sinon.assert.calledWith(sessionManager.sendSkip, adUnit, adUnit.getVideoPosition());
        });

        it('should set views through AdUnit API', () => {
            sinon.assert.calledWith(nativeBridge.AdUnit.setViews, ['webview']);
        });

        it('should hide overlay', () => {
            sinon.assert.called(adUnit.getOverlay().hide);
        });

        it('should show endscreen', () => {
            sinon.assert.called(adUnit.getEndScreen().show);
        });

    });

    describe('When calling onMute', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
            sinon.stub(sessionManager, 'getSession').returns({getId: sinon.spy()});
        });

        it('should set volume to zero when muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, true);

            sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should set volume to 1 when not muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, false);

            sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });
    });
});