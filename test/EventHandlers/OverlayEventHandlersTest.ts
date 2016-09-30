import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
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
import { Platform } from 'Constants/Platform';
import { AndroidVideoAdUnit } from 'AdUnits/AndroidVideoAdUnit';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

describe('OverlayEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let sessionManager: SessionManager;
    let videoAdUnit: AndroidVideoAdUnit;
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

        videoAdUnit = new AndroidVideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, <Overlay><any>{hide: sinon.spy()}, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnit, endScreen);

    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(sessionManager, 'sendSkip');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');

            OverlayEventHandlers.onSkip(nativeBridge, sessionManager, performanceAdUnit, videoAdUnit);
        });

        it('should pause video player', () => {
            sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(videoAdUnit.isVideoActive());
        });

        it('should set finish state', () => {
            assert.equal(videoAdUnit.getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendSkip, performanceAdUnit, videoAdUnit.getVideoPosition());
        });

        it('should set views through AdUnit API', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.AndroidAdUnit.setViews, ['webview']);
        });

        it('should hide overlay', () => {
            const overlay = videoAdUnit.getOverlay();
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
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, performanceAdUnit, true);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should set volume to 1 when not muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, performanceAdUnit, false);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });
    });

    describe('When calling onCallButton', () => {
        let vastAdUnit: VastAdUnit;
        let androidVideoUnit: AndroidVideoAdUnit;

        beforeEach(() => {
            androidVideoUnit = new AndroidVideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{getVast: sinon.spy()}, <Overlay><any>{}, null);
            vastAdUnit = new VastAdUnit(nativeBridge, androidVideoUnit);
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
            sinon.stub(sessionManager, 'getSession').returns({getId: sinon.spy()});
        });

        it('should call video click through tracking url', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
        });

        it('should open click trough link in iOS web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foo.com');
        });

        it('should open click trough link in Android web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': 'http://foo.com'
            });
        });
    });
});
