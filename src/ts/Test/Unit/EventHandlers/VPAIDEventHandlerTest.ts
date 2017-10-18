import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { VPAID } from 'Views/VPAID';
import { VPAID as VPAIDModel } from 'Models/VPAID/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { ForceOrientation, AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { Observable2, Observable0 } from 'Utilities/Observable';
import { Activity } from 'AdUnits/Containers/Activity';
import { ListenerApi } from 'Native/Api/Listener';
import { Platform } from 'Constants/Platform';
import { IntentApi } from 'Native/Api/Intent';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SdkApi } from 'Native/Api/Sdk';
import { FocusManager } from 'Managers/FocusManager';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Overlay } from 'Views/Overlay';
import { VPAIDEventHandler } from 'EventHandlers/VPAIDEventHandler';
import { FinishState } from 'Constants/FinishState';

import VPAIDTestXML from 'xml/VPAID.xml';
import VPAIDCampaignJson from 'json/OnProgrammaticVPAIDCampaign.json';

describe('VPAIDEventHandlerTest', () => {
    let campaign: VPAIDCampaign;
    let adUnit: VPAIDAdUnit;
    let vpaidView: VPAID;
    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let operativeEventManager: OperativeEventManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let container: AdUnitContainer;
    let focusManager: FocusManager;
    let vpaid: VPAIDModel;
    let vpaidAdUnitParameters: IVPAIDAdUnitParameters;
    let vpaidEventHandler: VPAIDEventHandler;
    let request: Request;
    let overlay: Overlay;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        vpaidView = <VPAID>sinon.createStubInstance(VPAID);
        (<any>vpaidView).onVPAIDEvent = new Observable2<string, any[]>();
        (<any>vpaidView).onCompanionView = new Observable0();
        (<any>vpaidView).onCompanionClick = new Observable0();
        (<any>vpaidView).onStuck = new Observable0();
        (<any>vpaidView).onSkip = new Observable0();
        nativeBridge = <NativeBridge>sinon.createStubInstance(NativeBridge);
        nativeBridge.Listener = <ListenerApi>sinon.createStubInstance(ListenerApi);
        nativeBridge.Intent = <IntentApi>sinon.createStubInstance(IntentApi);
        nativeBridge.UrlScheme = <UrlSchemeApi>sinon.createStubInstance(UrlSchemeApi);
        nativeBridge.Sdk = <SdkApi>sinon.createStubInstance(SdkApi);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        operativeEventManager = <OperativeEventManager>sinon.createStubInstance(OperativeEventManager);
        thirdPartyEventManager = <ThirdPartyEventManager>sinon.createStubInstance(ThirdPartyEventManager);
        container = <AdUnitContainer>sinon.createStubInstance(Activity);
        request = new Request(nativeBridge, wakeUpManager);
        vpaid = new VPAIDParser().parse(VPAIDTestXML);
        const vpaidCampaignJson = JSON.parse(VPAIDCampaignJson);
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });
        campaign = new VPAIDCampaign(vpaid, TestFixtures.getSession(), vpaidCampaignJson.campaignId, vpaidCampaignJson.gamerId, vpaidCampaignJson.abGroup);
        focusManager = <FocusManager>sinon.createStubInstance(FocusManager);
        (<any>focusManager).onAppForeground = new Observable0();
        (<any>focusManager).onAppBackground = new Observable0();
        (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);

        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        overlay = <Overlay><any> {};

        vpaidAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            vpaid: vpaidView,
            overlay: overlay
        };

        adUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);
        vpaidEventHandler = new VPAIDEventHandler(nativeBridge, adUnit, vpaidAdUnitParameters);
    });

    afterEach(() => {
        if (adUnit.isShowing()) {
            adUnit.hide();
        }
        sandbox.reset();
    });

    it('should forward the event to the observer', () => {
        const spy = sinon.spy();
        const eventType = 'AdEvent';
        const args = ['foo', 1, true, 'bar'];
        vpaidEventHandler.onVPAIDEvent = spy;
        // vpaid.onVPAIDEvent.subscribe(spy);

        window.postMessage({
            type: 'VPAID',
            eventType: eventType,
            args: args
        }, '*');

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    sinon.assert.calledWith(spy, eventType, args);
                    resolve();
                } catch(e) {
                    reject();
                }
            });
        });
    });

    describe('VPAID events', () => {
        const sdkVersion = 210;
        const verifyTrackingEvent = (eventType: string): (() => void) => {
            return () => {
                sinon.assert.called(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
                const urls = campaign.getTrackingEventUrls(eventType);
                for (const url of urls) {
                    sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, `vpaid ${eventType}`, campaign.getSession().getId(), url);
                }
            };
        };

        const triggerVPAIDEvent = (eventType: string, ...args: any[]): (() => void) => {
            return () => {
                vpaidEventHandler.onVPAIDEvent(eventType, args);
            };
        };

        beforeEach(() => {
            (<sinon.SinonStub>operativeEventManager.getClientInfo).returns({
                getSdkVersion: () => sdkVersion
            });
        });

        // Generic events that translate to VAST tracking with
        // no additional processing on our end.
        const vpaidToVASTTracking = {
            AdImpression: 'impression',
            AdVideoStart: 'start',
            AdPaused: 'paused',
            AdPlaying: 'resume'
        };

        // tslint:disable-next-line:forin
        for (const event in vpaidToVASTTracking) {
            describe(`on ${event}`, () => {
                beforeEach(triggerVPAIDEvent(event));
                it(`should trigger ${vpaidToVASTTracking[event]} tracking`, verifyTrackingEvent(vpaidToVASTTracking[event]));
            });
        }

        describe('on AdLoaded', () => {
            beforeEach(triggerVPAIDEvent('AdLoaded'));
            it('should show the ad on the view', () => {
                sinon.assert.called(<sinon.SinonSpy>vpaidView.showAd);
            });
        });

        describe('on AdVideoFirstQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoFirstQuartile'));
            it('should trigger firstQuartile tracking', verifyTrackingEvent('firstQuartile'));
            it('should send the first quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendFirstQuartile);
            });
        });

        describe('on AdVideoMidpoint', () => {
            beforeEach(triggerVPAIDEvent('AdVideoMidpoint'));
            it('should trigger midpoint tracking', verifyTrackingEvent('midpoint'));
            it('should send the midpoint operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendMidpoint);
            });
        });

        describe('on AdVideoThirdQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoThirdQuartile'));
            it('should trigger thirdQuartile tracking', verifyTrackingEvent('thirdQuartile'));
            it('should send the third quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
            });
        });

        describe('on AdVideoComplete', () => {
            beforeEach(triggerVPAIDEvent('AdVideoComplete'));
            it('should trigger complete tracking', verifyTrackingEvent('complete'));
            it('should send the view operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendView);
            });
            it('should set the finish state to COMPLETE', () => {
                assert.isTrue(adUnit.getFinishState() === FinishState.COMPLETED);
            });
        });

        describe('on AdSkipped', () => {
            beforeEach(() => {
                (<sinon.SinonStub>vpaidView.container).returns(document.createElement('div'));
                (<sinon.SinonStub>container.open).returns(Promise.resolve());
                (<sinon.SinonStub>container.close).returns(Promise.resolve());
                (<sinon.SinonStub>nativeBridge.Listener.sendFinishEvent).returns(Promise.resolve());
                return adUnit.show();
            });
            beforeEach(triggerVPAIDEvent('AdSkipped'));

            it('should trigger skip tracking', verifyTrackingEvent('skip'));
            it('should send the skip operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendSkip);
            });
            it('should set the finish state to COMPLETE', () => {
                assert.isTrue(adUnit.getFinishState() === FinishState.SKIPPED);
            });

            it('should hide the view', () => {
                sinon.assert.called(<sinon.SinonSpy>vpaidView.hide);
            });

            it('should close the container', () => {
                sinon.assert.called(<sinon.SinonSpy>container.close);
            });
        });

        describe('on AdError', () => {
            beforeEach(() => {
                (<sinon.SinonStub>vpaidView.container).returns(document.createElement('div'));
                (<sinon.SinonStub>container.open).returns(Promise.resolve());
                (<sinon.SinonStub>container.close).returns(Promise.resolve());
                (<sinon.SinonStub>nativeBridge.Listener.sendFinishEvent).returns(Promise.resolve());
                return adUnit.show();
            });
            beforeEach(triggerVPAIDEvent('AdError'));

            it('should trigger error tracking', verifyTrackingEvent('error'));
            it('should set the finish state to ERROR', () => {
                assert.isTrue(adUnit.getFinishState() === FinishState.ERROR);
            });

            it('should hide the view', () => {
                sinon.assert.called(<sinon.SinonSpy>vpaidView.hide);
            });

            it('should close the container', () => {
                sinon.assert.called(<sinon.SinonSpy>container.close);
            });
        });

        describe('on AdClickThru', () => {

            const checkClickThroughTracking = () => {
                const urls = campaign.getVideoClickTrackingURLs();
                for (const url of urls) {
                    sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, `vpaid video click`, campaign.getSession().getId(), url);
                }
            };

            describe('on android', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
                });

                describe('when url is passed', () => {
                    const aURL = 'http://learnmore2.unityads.unity3d.com';
                    beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));

                    it('should open the url passed', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                            action: 'android.intent.action.VIEW',
                            uri: aURL
                        });
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                            action: 'android.intent.action.VIEW',
                            uri: campaign.getVideoClickThroughURL()
                        });
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });

            describe('on ios', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
                });

                describe('when url is passed', () => {
                    const aURL = 'http://learnmore2.unityads.unity3d.com';
                    beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));

                    it('should open the url passed', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, campaign.getVideoClickThroughURL());
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });
        });
    });
});
