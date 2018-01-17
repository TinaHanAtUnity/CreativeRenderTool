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
import { Activity } from 'AdUnits/Containers/Activity';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { FocusManager } from 'Managers/FocusManager';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Overlay } from 'Views/Overlay';
import { VPAIDEventHandler } from 'EventHandlers/VPAIDEventHandler';
import { FinishState } from 'Constants/FinishState';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

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
    let comScoreService: ComScoreTrackingService;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);

        nativeBridge = TestFixtures.getNativeBridge();

        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);

        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

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

        campaign = TestFixtures.getVPAIDCampaign();
        vpaidView = new VPAID(nativeBridge, campaign, placement, 'en', 'TestGameId');

        const sessionManager = new SessionManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sinon.spy(thirdPartyEventManager, 'sendEvent');

        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());

        vpaidAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: placement,
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            vpaid: vpaidView,
            overlay: overlay
        };

        sinon.stub(vpaidAdUnitParameters.campaign, 'getAbGroup').returns(5);

        adUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);
        vpaidEventHandler = new VPAIDEventHandler(nativeBridge, adUnit, vpaidAdUnitParameters);
        vpaidView.addEventHandler(vpaidEventHandler);
        adUnit.show();
    });

    afterEach(() => {
        if (adUnit.isShowing()) {
            adUnit.hide();
        }
        sandbox.reset();
    });

    xit('should forward the event to the observer', () => {
        const eventType = 'AdEvent';
        const args = ['foo', 1, true, 'bar'];
        sinon.spy(vpaidEventHandler, 'onVPAIDEvent');
        // sinon.stub(vpaidEventHandler, 'onVPAIDEvent').callsFake((receivedEventType: string, receivedArgs: any[]) => {
          //  assert.equal(eventType, receivedEventType, 'event type not what was expected');
           // assert.deepEqual(args, receivedArgs, 'received args not what was expe');
            // done();
        // });

        window.postMessage({
            type: 'VPAID',
            eventType: eventType,
            args: args
        }, '*');

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    sinon.assert.calledWith(<sinon.SinonSpy>vpaidEventHandler.onVPAIDEvent, eventType, args);
                    resolve();
                } catch(e) {
                    reject(e);
                }
            }, 0);
        });
    });

    describe('VPAID events', () => {
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
            sinon.spy(vpaidView, 'showAd');
            sinon.spy(operativeEventManager, 'sendFirstQuartile');
            sinon.spy(operativeEventManager, 'sendMidpoint');
            sinon.spy(operativeEventManager, 'sendThirdQuartile');
            sinon.spy(operativeEventManager, 'sendView');
            sinon.spy(comScoreService, 'sendEvent');
        });

        // Generic events that translate to VAST tracking with
        // no additional processing on our end.
        const vpaidToVASTTracking: { [key: string]: string } = {
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
            it('should send the comscore end event', () => {
                sinon.assert.called(<sinon.SinonSpy>comScoreService.sendEvent);
            });
            it('should set the finish state to COMPLETE', () => {
                assert.isTrue(adUnit.getFinishState() === FinishState.COMPLETED);
            });
        });

        describe('on AdSkipped', () => {
            beforeEach(() => {
                sinon.spy(operativeEventManager, 'sendSkip');
                sinon.spy(vpaidView, 'hide');
                sinon.stub(vpaidView, 'container').returns(document.createElement('div'));
                sinon.stub(container, 'open').returns(Promise.resolve());
                sinon.stub(container, 'close').returns(Promise.resolve());
                sinon.stub(nativeBridge.Listener, 'sendFinishEvent').returns(Promise.resolve());
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
                sinon.spy(vpaidView, 'hide');
                sinon.stub(vpaidView, 'container').returns(document.createElement('div'));
                sinon.stub(container, 'open').returns(Promise.resolve());
                sinon.stub(container, 'close').returns(Promise.resolve());
                sinon.stub(nativeBridge.Listener, 'sendFinishEvent').returns(Promise.resolve());
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
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                    sinon.spy(nativeBridge.Intent, 'launch');
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
                    sinon.spy(nativeBridge.UrlScheme, 'open');
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
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
