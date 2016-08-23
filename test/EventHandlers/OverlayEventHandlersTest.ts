import 'mocha';
import { assert } from 'chai';
import * as Sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
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

describe('OverlayEventHandlersTest', () => {

    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge, adUnit: VideoAdUnit;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: Sinon.spy()}, <Overlay><any>{hide: Sinon.spy()}, <EndScreen><any>{show: Sinon.spy()});
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            Sinon.spy(nativeBridge.VideoPlayer, 'pause');
            Sinon.spy(sessionManager, 'sendSkip');
            Sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');

            OverlayEventHandlers.onSkip(nativeBridge, sessionManager, adUnit);
        });

        it('should pause video player', () => {
            Sinon.assert.called(<Sinon.SinonSpy>nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(adUnit.isVideoActive());
        });

        it('should set finish state', () => {
            assert.equal(adUnit.getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            Sinon.assert.calledWith(<Sinon.SinonSpy>sessionManager.sendSkip, adUnit, adUnit.getVideoPosition());
        });

        it('should set views through AdUnit API', () => {
            Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.AndroidAdUnit.setViews, ['webview']);
        });

        it('should hide overlay', () => {
            Sinon.assert.called(<Sinon.SinonSpy>adUnit.getOverlay().hide);
        });

        it('should show endscreen', () => {
            let endScreen = adUnit.getEndScreen();
            if(endScreen) {
                Sinon.assert.called(<Sinon.SinonSpy>endScreen.show);
            }
        });

    });

    describe('When calling onMute', () => {
        beforeEach(() => {
            Sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
            Sinon.stub(sessionManager, 'getSession').returns({getId: Sinon.spy()});
        });

        it('should set volume to zero when muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, true);

            Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should set volume to 1 when not muted', () => {
            OverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, false);

            Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });
    });

    describe('When calling onCallButton', () => {
        let vastAdUnit: VastAdUnit;

        beforeEach(() => {
            vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{getVast: Sinon.spy()}, <Overlay><any>{});
            Sinon.spy(nativeBridge.VideoPlayer, 'pause');
            Sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            Sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(Sinon.spy());
            Sinon.stub(sessionManager, 'getSession').returns({getId: Sinon.spy()});
        });

        it('should call video click through tracking url', () => {
            Sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            Sinon.stub(nativeBridge.UrlScheme, 'open');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            Sinon.assert.calledOnce(<Sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
        });

        it('should open click trough link in iOS web browser when call button is clicked', () => {
            Sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            Sinon.stub(nativeBridge.UrlScheme, 'open');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foo.com');
        });

        it('should open click trough link in Android web browser when call button is clicked', () => {
            Sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            Sinon.stub(nativeBridge.Intent, 'launch');
            OverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': 'http://foo.com'
            });
        });
    });
});
