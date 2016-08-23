import 'mocha';
import * as Sinon from 'sinon';

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

    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge, adUnit: VideoAdUnit, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = <Overlay><any> {
            setSkipEnabled: Sinon.spy(),
            setSkipDuration: Sinon.spy(),
            show: Sinon.spy(),
        };

        endScreen = <EndScreen><any> {
            hide: Sinon.spy(),
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

            Sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            Sinon.spy(nativeBridge.Intent, 'launch');
        });

        it('should send a click with session manager', () => {
            EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            Sinon.assert.calledWith(<Sinon.SinonSpy>sessionManager.sendClick, adUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'http://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should throw error', () => {
                let response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<Sinon.SinonSpy>sessionManager.sendClick).restore();
                Sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    Sinon.assert.notCalled(<Sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });

        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                Sinon.stub(adUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            });

            it('should launch market view', () => {
                Sinon.assert.calledWith(<Sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=fooAppId'
                });
            });

        });


    });

});
