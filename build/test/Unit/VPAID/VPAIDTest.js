import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { Observable1 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAID as VPAIDModel } from 'VPAID/Models/VPAID';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
describe('VPAID View', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let campaign;
    let eventHandler;
    let webPlayerContainer;
    let view;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        campaign = sinon.createStubInstance(VPAIDCampaign);
        const deviceInfo = sinon.createStubInstance(DeviceInfoApi);
        deviceInfo.getScreenWidth.returns(Promise.resolve(320));
        deviceInfo.getScreenHeight.returns(Promise.resolve(480));
        core.DeviceInfo = deviceInfo;
        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        webPlayerContainer.onWebPlayerEvent = new Observable1();
        webPlayerContainer.setData.resolves();
        webPlayerContainer.sendEvent.resolves();
        const model = sinon.createStubInstance(VPAIDModel);
        model.getCreativeParameters.returns('{}');
        campaign.getVPAID.returns(model);
        view = new VPAID(platform, core, webPlayerContainer, campaign, TestFixtures.getPlacement());
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
            sinon.assert.called(webPlayerContainer.setData);
        });
    });
    const verifyEventSent = (event, parameters) => {
        return () => {
            const webPlayerParams = [event];
            if (parameters) {
                webPlayerParams.push(parameters);
            }
            sinon.assert.calledWith(webPlayerContainer.sendEvent, webPlayerParams);
        };
    };
    const sendWebPlayerEvent = (event, ...parameters) => {
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
                sinon.assert.calledWith(eventHandler.onVPAIDProgress, 1, 2);
            });
        });
        describe('on webplayer "VPAID" event', () => {
            const event = 'AdLoaded';
            const params = ['foo', 'bar'];
            beforeEach(sendWebPlayerEvent('VPAID', [event, params]));
            it('should forward the event to the handler', () => {
                sinon.assert.calledWith(eventHandler.onVPAIDEvent, event, params);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZQQUlEL1ZQQUlEVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUVoRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQWlCLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXpELFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3hCLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksUUFBdUIsQ0FBQztJQUM1QixJQUFJLFlBQTJCLENBQUM7SUFDaEMsSUFBSSxrQkFBc0MsQ0FBQztJQUMzQyxJQUFJLElBQVcsQ0FBQztJQUVoQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMs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