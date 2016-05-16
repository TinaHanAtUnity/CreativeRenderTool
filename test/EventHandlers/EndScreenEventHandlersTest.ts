/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { EndScreenEventHandlers } from '../../src/ts/EventHandlers/EndScreenEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { Overlay } from '../../src/ts/Views/Overlay';
import { EndScreen } from '../../src/ts/Views/EndScreen';
import { SessionManager } from '../../src/ts/Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { Request } from '../../src/ts/Utilities/Request';
import { VideoAdUnit } from '../../src/ts/AdUnits/VideoAdUnit';
import { Campaign } from '../../src/ts/Models/Campaign';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';

describe('EndScreenEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, adUnit, overlay, endScreen;
    let sessionManager;

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

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign>{getVideoUrl: () => 'fake url', getAppStoreId: () => 'fooAppId', getClickAttributionUrlFollowsRedirects: () => true }, overlay, endScreen);
    });

    describe('with onDownload', () => {
        let resolvedPromise;

        beforeEach(() => {
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');
        });

        it('should send a click with session manager', () => {
            EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(sessionManager.sendClick, adUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'http://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should throw error', () => {
                let response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sessionManager.sendClick.restore();
                sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(nativeBridge.Intent.launch);
                });
            });

        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(adUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);

                EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit);

            });

            it('should launch market view', () => {
                sinon.assert.calledWith(nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=fooAppId'
                });
            });

        });


    });

    describe('with onReplay', () => {
        let resolvedPromise;

        beforeEach(() => {
            resolvedPromise = Promise.resolve();

            sinon.spy(nativeBridge.VideoPlayer, 'prepare');
            sinon.stub(nativeBridge.AndroidAdUnit, 'setViews').returns(resolvedPromise);
        });

        it('should activate video', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            assert.isTrue(adUnit.isVideoActive());
        });

        it('should set video position to start', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            assert.equal(adUnit.getVideoPosition(), 0);
        });

        it('should setup skipping', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            sinon.assert.calledWith(adUnit.getOverlay().setSkipEnabled, true);
            sinon.assert.calledWith(adUnit.getOverlay().setSkipDuration, 0);
        });

        it('should hide endscreen', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            sinon.assert.called(adUnit.getEndScreen().hide);
        });

        it('should show overlay', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            sinon.assert.called(adUnit.getOverlay().show);
        });

        it('should call native for views', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            sinon.assert.calledWith(nativeBridge.AndroidAdUnit.setViews, ['videoplayer', 'webview']);
        });

        it('should prepare video', () => {
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            return resolvedPromise.then(() => {
                sinon.assert.calledWith(nativeBridge.VideoPlayer.prepare, 'fake url', new Double(1.0));
            });
        });

        it('should prepare muted video', () => {
            sinon.stub(adUnit.getPlacement(), 'muteVideo').returns(true);
            EndScreenEventHandlers.onReplay(nativeBridge, adUnit);

            return resolvedPromise.then(() => {
                sinon.assert.calledWith(nativeBridge.VideoPlayer.prepare, 'fake url', new Double(0.0));
            });
        });

    });

});
