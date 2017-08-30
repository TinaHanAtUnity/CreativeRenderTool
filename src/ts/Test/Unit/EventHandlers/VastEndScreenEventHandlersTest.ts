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
import { INativeResponse } from 'Utilities/Request';

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
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy()
            };
            const video = new Video('');
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, <Placement><any>{}, <VastCampaign><any>{
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
            vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, <Placement><any>{}, <VastCampaign><any>{
                getVast: sinon.spy(),
                getVideo: () => video
            }, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null, vastEndScreen);
        });

        it('should should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');
            sinon.stub(request, 'head').withArgs('https://bar.com').returns(Promise.resolve(<INativeResponse>{
                responseCode: 200
            }));

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
            });
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
            sinon.stub(request, 'head').withArgs('https://foo.com').returns(Promise.resolve(<INativeResponse>{
                responseCode: 200
            }));

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
            });
        });

        it('should open click through link on Android', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
            sinon.stub(request, 'head').withArgs('https://foo.com').returns(Promise.resolve(<INativeResponse>{
                responseCode: 200
            }));

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'https://foo.com'
                });
            });
        });

        it('should follow redirects from links and open the last one in the chain', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
            sinon.stub(request, 'head').callsFake((url) => {
                if (url === 'https://foo.com') {
                    return Promise.resolve(<INativeResponse>{
                        responseCode: 302,
                        headers: [
                            ['location', 'https://bar.com']
                        ]
                    });
                } else if (url === 'https://bar.com') {
                    return Promise.resolve(<INativeResponse>{
                        responseCode: 200
                    });
                } else {
                    return Promise.resolve(<INativeResponse>{
                        responseCode: 404
                    });
                }
            });

            return VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, vastAdUnit, request).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'https://bar.com'
                });
            });
        });
    });
});
