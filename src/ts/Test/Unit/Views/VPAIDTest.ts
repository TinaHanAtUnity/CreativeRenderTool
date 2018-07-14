import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import VPAIDTestXML from 'xml/VPAIDWithAdParameters.xml';
import VPAIDCampaignJson from 'json/OnProgrammaticVPAIDCampaign.json';
import { VPAID as VPAIDModel } from 'Models/VPAID/VPAID';
import { VPAID, IVPAIDHandler } from 'Views/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { WebPlayerApi } from 'Native/Api/WebPlayer';
import { Observable1 } from 'Utilities/Observable';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { setTimeout } from 'timers';
import { Privacy } from 'Views/Privacy';

describe('VPAID View', () => {
    let nativeBridge: NativeBridge;
    let campaign: VPAIDCampaign;
    let eventHandler: IVPAIDHandler;
    let view: VPAID;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        campaign = sinon.createStubInstance(VPAIDCampaign);

        const deviceInfo = sinon.createStubInstance(DeviceInfoApi);
        (<sinon.SinonStub>deviceInfo.getScreenWidth).returns(Promise.resolve(320));
        (<sinon.SinonStub>deviceInfo.getScreenHeight).returns(Promise.resolve(480));
        (<any>nativeBridge).DeviceInfo = deviceInfo;

        const webPlayer = sinon.createStubInstance(WebPlayerApi);
        (<any>webPlayer).onWebPlayerEvent = new Observable1<string>();
        (<sinon.SinonStub>webPlayer.setData).returns(Promise.resolve());
        (<sinon.SinonStub>webPlayer.sendEvent).returns(Promise.resolve());
        (<any>nativeBridge).WebPlayer = webPlayer;

        const model = sinon.createStubInstance(VPAIDModel);
        (<sinon.SinonStub>model.getCreativeParameters).returns('{}');
        (<sinon.SinonStub>campaign.getVPAID).returns(model);

        const privacy = new Privacy(nativeBridge, true);
        view = new VPAID(nativeBridge, campaign, TestFixtures.getPlacement());

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
            sinon.assert.called(<sinon.SinonSpy>nativeBridge.WebPlayer.setData);
        });
    });

    const verifyEventSent = (event: string, parameters?: any[]) => {
        return () => {
            const webPlayerParams: any[] = [event];
            if (parameters) {
                webPlayerParams.push(parameters);
            }
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.WebPlayer.sendEvent, webPlayerParams);
        };
    };

    const sendWebPlayerEvent = (event: string, ...parameters: any[]) => {
        return () => {
            let args = [];
            if (parameters.length > 0) {
                args = parameters;
            }
            args.unshift(event);

            nativeBridge.WebPlayer.onWebPlayerEvent.trigger(JSON.stringify(args));

            return new Promise((res) => window.setTimeout(res));
        };
    };

    describe('hide', () => {
        beforeEach(() => {
            view.hide();
        });
        it('should send the "destroy" event', verifyEventSent('destroy'));
    });

    describe('showAd', () => {
        beforeEach(() => {
            view.showAd();
        });
        it('should send the "show" event', verifyEventSent('show'));
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
