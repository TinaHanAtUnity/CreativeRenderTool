import { IAdsApi } from 'Ads/IAds';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Closer } from 'Ads/Views/Closer';
import { Backend } from 'Backend/Backend';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { IVPAIDEventHandlerParameters, VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';

describe('VPAIDEventHandlerTest @skipOnDevice', () => {
    let eventHandler: VPAIDEventHandler;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let adUnit: VPAIDAdUnit;
    let parameters: IVPAIDEventHandlerParameters;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        parameters = {
            core,
            ads,
            campaign: sinon.createStubInstance(VPAIDCampaign),
            closer: sinon.createStubInstance(Closer),
            endScreen: sinon.createStubInstance(VPAIDEndScreen),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: TestFixtures.getPlacement()
        };
        adUnit = sinon.createStubInstance(VPAIDAdUnit);
        (<sinon.SinonStub>parameters.campaign.getSession).returns(TestFixtures.getSession());
        (<sinon.SinonStub>parameters.campaign.getVideoClickTrackingURLs).returns(['https://tracking.unityads.unity3d.com']);
        (<sinon.SinonStub>parameters.campaign.getVideoClickThroughURL).returns('https://unityads.unity3d.com');

        eventHandler = new VPAIDEventHandler(adUnit, parameters);
    });

    describe('VPAID events', () => {
        const triggerVPAIDEvent = (eventType: string, ...args: any[]) => {
            return () => {
                eventHandler.onVPAIDEvent(eventType, args);
            };
        };

        const verifyTrackingEvent = (eventType: TrackingEvent) => {
            return () => {
                sinon.assert.calledWith(<sinon.SinonStub>adUnit.sendTrackingEvent, eventType);
            };
        };

        describe('on AdLoaded', () => {
            beforeEach(triggerVPAIDEvent('AdLoaded'));
            it('should call adLoaded on the ad unit', () => {
                sinon.assert.called(<sinon.SinonStub>adUnit.onAdLoaded);
            });
        });

        describe('on AdVideoFirstQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoFirstQuartile'));
            it('should trigger firstQuartile tracking', verifyTrackingEvent(TrackingEvent.FIRST_QUARTILE));
            it('should send the first quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendFirstQuartile);
            });
        });

        describe('on AdVideoMidpoint', () => {
            beforeEach(triggerVPAIDEvent('AdVideoMidpoint'));
            it('should trigger midpoint tracking', verifyTrackingEvent(TrackingEvent.MIDPOINT));
            it('should send the midpoint operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendMidpoint);
            });
        });

        describe('on AdVideoThirdQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoThirdQuartile'));
            it('should trigger thirdQuartile tracking', verifyTrackingEvent(TrackingEvent.THIRD_QUARTILE));
            it('should send the third quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendThirdQuartile);
            });
        });

        describe('on AdVideoComplete', () => {
            beforeEach(triggerVPAIDEvent('AdVideoComplete'));
            it('should trigger complete tracking', verifyTrackingEvent(TrackingEvent.COMPLETE));
            it('should send the view operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendView);
            });
            it('should set the finish state to COMPLETE', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.COMPLETED);
            });
        });

        describe('on AdSkipped', () => {
            beforeEach(triggerVPAIDEvent('AdSkipped'));

            it('should trigger skip tracking', verifyTrackingEvent(TrackingEvent.SKIP));
            it('should send the skip operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendSkip);
            });
            it('should set the finish state to SKIPPED', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.SKIPPED);
            });
            it('should hide the ad unit', () => {
                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });

        describe('on AdError', () => {
            beforeEach(triggerVPAIDEvent('AdError'));

            it('should trigger error tracking', verifyTrackingEvent(TrackingEvent.ERROR));
            it('should set the finish state to ERROR', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.ERROR);
            });

            it('should hide the ad unit', () => {
                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });

        describe('on AdClickThru', () => {

            beforeEach(() => {
                parameters.campaign.setTrackingUrls({});
            });

            const checkClickThroughTracking = () => {
                // Works because no additional tracking URLs are provided outside of the VPAID
                const urls = parameters.campaign.getTrackingUrlsForEvent(TrackingEvent.CLICK);
                for (const url of urls) {
                    sinon.assert.calledWith(<sinon.SinonSpy>parameters.thirdPartyEventManager.sendWithGet, 'vpaid click', TestFixtures.getSession().getId(), url);
                }
            };

            describe('on android', () => {
                beforeEach(() => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                });

                describe('when url is passed', () => {
                    const aURL = 'http://learnmore2.unityads.unity3d.com';
                    beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));

                    it('should open the url passed', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition included in the set of tracking URLs', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, parameters.campaign.getTrackingUrlsForEvent(TrackingEvent.CLICK));
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });

            describe('on ios', () => {
                beforeEach(() => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                });

                describe('when url is passed', () => {
                    const aURL = 'http://learnmore2.unityads.unity3d.com';
                    beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));

                    it('should open the url passed', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition included in the set of tracking URLs', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, parameters.campaign.getTrackingUrlsForEvent(TrackingEvent.CLICK));
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });
        });
    });
});
