import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { Placement } from 'Models/Placement';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { FocusManager } from 'Managers/FocusManager';
import { WakeUpManager } from 'Managers/WakeUpManager';

describe('VastEndScreenEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    const sessionManager = <SessionManager><any>{};
    let container: AdUnitContainer;
    let request: Request;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
        sinon.stub(request, 'followRedirectChain').callsFake((url) => {
            return Promise.resolve(url);
        });
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            const video = new Video('');
            const vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getSession(), ForceOrientation.NONE, container, <Placement><any>{}, <VastCampaign><any>{
                getVast: sinon.spy(),
                getVideo: () => video
            }, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null, vastEndScreen);
            sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());

            VastEndScreenEventHandlers.onClose(vastAdUnit);
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });
    });

    describe('when calling onClick', () => {
        let vastAdUnit: VastAdUnit;
        let video: Video;

        beforeEach(() => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            video = new Video('');
            vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getSession(), ForceOrientation.NONE, container, <Placement><any>{}, <VastCampaign><any>{
                getVast: sinon.spy(),
                getVideo: () => video
            }, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null, vastEndScreen);
        });

        it('should should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
            });
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
            });
        });

        it('should open click through link on Android', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'https://foo.com'
                });
            });
        });
    });
});
