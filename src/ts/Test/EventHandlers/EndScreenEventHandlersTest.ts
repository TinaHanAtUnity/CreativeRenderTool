import 'mocha';
import * as sinon from 'sinon';

import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventManager } from 'Managers/EventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { Campaign } from 'Models/Campaign';
import { WakeUpManager } from 'Managers/WakeUpManager';

describe('EndScreenEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, adUnit: VideoAdUnit, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = <Overlay><any> {
            setSkipEnabled: sinon.spy(),
            setSkipDuration: sinon.spy(),
            show: sinon.spy(),
        };

        endScreen = <EndScreen><any> {
            hide: sinon.spy(),
        };

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign>{
            getVideoUrl: () => 'fake url',
            getAppStoreId: () => 'fooAppId',
            getClickAttributionUrlFollowsRedirects: () => true
        }, overlay, endScreen);
    });

    describe('with onDownload', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');
        });

        it('should send a click with session manager', () => {
            EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, adUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'http://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should throw error', () => {
                let response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>sessionManager.sendClick).restore();
                sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });

        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(adUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            });

            it('should launch market view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=fooAppId'
                });
            });

        });


    });

});
