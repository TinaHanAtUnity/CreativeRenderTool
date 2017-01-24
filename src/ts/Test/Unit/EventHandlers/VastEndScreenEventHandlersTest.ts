import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Placement } from 'Models/Placement';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';
import { AdUnit } from 'Utilities/AdUnit';

describe('VastEndScreenEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let adUnit: AdUnit;
    const sessionManager = <SessionManager><any>{};
    let videoAdUnitController: VideoAdUnitController;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

        videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, <Placement><any>{}, <VastCampaign><any>{getVast: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), <Overlay><any>{hide: sinon.spy()}, null);
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            const vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController, vastEndScreen);
            sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());

            VastEndScreenEventHandlers.onClose(vastAdUnit);
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });
    });

    describe('when calling onClick', () => {
        let vastAdUnit: VastAdUnit;

        beforeEach(() => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController, vastEndScreen);
        });

        it('should should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
        });

        it('should open click through link on Android', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': 'https://foo.com'
            });
        });
    });
});
