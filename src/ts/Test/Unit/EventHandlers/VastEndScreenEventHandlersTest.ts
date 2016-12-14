import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { Placement } from 'Models/Placement';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';

describe('VastEndScreenEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, adUnit: VastAdUnit;
    let videoAdUnitController: AndroidVideoAdUnitController;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID), <Placement><any>{}, <VastCampaign><any>{getVast: sinon.spy()}, <Overlay><any>{hide: sinon.spy()}, null);
        adUnit = new VastAdUnit(nativeBridge, videoAdUnitController);
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            const vastAdUnit = new VastAdUnit(nativeBridge, videoAdUnitController, vastEndScreen);
            sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());

            VastEndScreenEventHandlers.onClose(vastAdUnit);
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });
    });

    describe('when calling onClick', () => {
        let vastAdUnit: VastAdUnit;
        let sessionManager: SessionManager;

        beforeEach(() => {
            sessionManager = <SessionManager><any>{
                sendBrandClickThrough: sinon.spy(),
                sendCompanionClickThrough: sinon.spy()
            };

            const vastEndScreen = <VastEndScreen><any>{
                hide: sinon.spy()
            };
            vastAdUnit = new VastAdUnit(nativeBridge, videoAdUnitController, vastEndScreen);
        });

        it('should should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendCompanionClickThrough, vastAdUnit);
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendCompanionClickThrough, vastAdUnit);
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
            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendCompanionClickThrough, vastAdUnit);
        });

        it('should should not open link when there is no URL', () => {
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);

            VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.notCalled(<sinon.SinonSpy>sessionManager.sendCompanionClickThrough);
        });
    });
});
