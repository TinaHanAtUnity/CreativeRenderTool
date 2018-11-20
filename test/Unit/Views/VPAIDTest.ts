import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { Observable1 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { VPAID as VPAIDModel } from 'VPAID/Models/VPAID';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { IVPAIDHandler, VPAID } from 'VPAID/Views/VPAID';

describe('VPAID View', () => {
    let nativeBridge: NativeBridge;
    let campaign: VPAIDCampaign;
    let eventHandler: IVPAIDHandler;
    let webPlayerContainer: WebPlayerContainer;
    let view: VPAID;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        campaign = sinon.createStubInstance(VPAIDCampaign);

        const deviceInfo = sinon.createStubInstance(DeviceInfoApi);
        deviceInfo.getScreenWidth.returns(Promise.resolve(320));
        deviceInfo.getScreenHeight.returns(Promise.resolve(480));
        (<any>nativeBridge).DeviceInfo = deviceInfo;

        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<any>webPlayerContainer).onWebPlayerEvent = new Observable1<string>();
        (<sinon.SinonStub>webPlayerContainer.setData).resolves();
        (<sinon.SinonStub>webPlayerContainer.sendEvent).resolves();

        const model = sinon.createStubInstance(VPAIDModel);
        model.getCreativeParameters.returns('{}');
        (<sinon.SinonStub>campaign.getVPAID).returns(model);

        view = new VPAID(nativeBridge, webPlayerContainer, campaign, TestFixtures.getPlacement());

        eventHandler = {
            onVPAIDCompanionClick: sinon.spy(),
            onVPAIDCompanionView: sinon.spy(),
            onVPAIDEvent: sinon.spy(),
            onVPAIDStuck: sinon.spy(),
            onVPAIDSkip: sinon.spy(),
            onVPAIDProgress: sinon.spy()
        };
        view.addEventHandler(eventHandler);
    });

    describe('loading web player', () => {
        beforeEach(() => {
            return view.loadWebPlayer();
        });

        it('should call setData on the WebPlayer', () => {
            sinon.assert.called(<sinon.SinonSpy>webPlayerContainer.setData);
        });
    });

    const verifyEventSent = (event: string, parameters?: any[]) => {
        return () => {
            const webPlayerParams: any[] = [event];
            if (parameters) {
                webPlayerParams.push(parameters);
            }
            sinon.assert.calledWith(<sinon.SinonSpy>webPlayerContainer.sendEvent, webPlayerParams);
        };
    };

    const sendWebPlayerEvent = (event: string, ...parameters: any[]) => {
        return () => {
            let args = [];
            if (parameters.length > 0) {
                args = parameters;
            }
            args.unshift(event);

            webPlayerContainer.onWebPlayerEvent.trigger(JSON.stringify(args));

            return new Promise((res) => window.setTimeout(res));
        };
    };

    describe('hide', () => {
        beforeEach(() => {
            view.hide();
        });
        it('should send the "destroy" event', verifyEventSent('destroy'));
    });

    describe('pauseAd', () => {
        beforeEach(() => {
            view.pauseAd();
        });
        it('should send the "pause" event', verifyEventSent('pause'));
    });

    describe('resumeAd', () => {
        beforeEach(() => {
            view.resumeAd();
        });
        it('should send the "resume" event', verifyEventSent('resume'));
    });

    describe('mute', () => {
        beforeEach(() => {
            view.mute();
        });
        it('should send the "mute" event', verifyEventSent('mute'));
    });

    describe('unmute', () => {
        beforeEach(() => {
            view.unmute();
        });
        it('should send the "unmute" event', verifyEventSent('unmute'));
    });

    describe('handling web player events', () => {
        beforeEach(() => {
            return view.loadWebPlayer();
        });

        describe('on webplayer "ready" event', () => {
            beforeEach(sendWebPlayerEvent('ready'));

            it('should respond with the "init" event', verifyEventSent('init', [{
                width: 320,
                height: 480,
                bitrate: 500,
                viewMode: 'normal',
                creativeData: {
                    AdParameters: '{}'
                }
            }]));
        });

        describe('on webplayer "progress" event', () => {
            beforeEach(sendWebPlayerEvent('progress', [1, 2]));
            it('should forward the event to the handler', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>eventHandler.onVPAIDProgress, 1, 2);
            });
        });

        describe('on webplayer "VPAID" event', () => {
            const event = 'AdLoaded';
            const params = ['foo', 'bar'];

            beforeEach(sendWebPlayerEvent('VPAID', [event, params]));
            it('should forward the event to the handler', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>eventHandler.onVPAIDEvent, event, params);
            });
        });
    });
});
