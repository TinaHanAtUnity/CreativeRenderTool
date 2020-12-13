import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Closer } from 'Ads/Views/Closer';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
describe('VPAIDEventHandlerTest @skipOnDevice', () => {
    let eventHandler;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let adUnit;
    let parameters;
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
        parameters.campaign.getSession.returns(TestFixtures.getSession());
        parameters.campaign.getVideoClickTrackingURLs.returns(['https://tracking.unityads.unity3d.com']);
        parameters.campaign.getVideoClickThroughURL.returns('https://unityads.unity3d.com');
        eventHandler = new VPAIDEventHandler(adUnit, parameters);
    });
    describe('VPAID events', () => {
        const triggerVPAIDEvent = (eventType, ...args) => {
            return () => {
                eventHandler.onVPAIDEvent(eventType, args);
            };
        };
        const verifyTrackingEvent = (eventType) => {
            return () => {
                sinon.assert.calledWith(adUnit.sendTrackingEvent, eventType);
            };
        };
        describe('on AdLoaded', () => {
            beforeEach(triggerVPAIDEvent('AdLoaded'));
            it('should call adLoaded on the ad unit', () => {
                sinon.assert.called(adUnit.onAdLoaded);
            });
        });
        describe('on AdVideoFirstQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoFirstQuartile'));
            it('should trigger firstQuartile tracking', verifyTrackingEvent(TrackingEvent.FIRST_QUARTILE));
            it('should send the first quartile operative event', () => {
                sinon.assert.called(parameters.operativeEventManager.sendFirstQuartile);
            });
        });
        describe('on AdVideoMidpoint', () => {
            beforeEach(triggerVPAIDEvent('AdVideoMidpoint'));
            it('should trigger midpoint tracking', verifyTrackingEvent(TrackingEvent.MIDPOINT));
            it('should send the midpoint operative event', () => {
                sinon.assert.called(parameters.operativeEventManager.sendMidpoint);
            });
        });
        describe('on AdVideoThirdQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoThirdQuartile'));
            it('should trigger thirdQuartile tracking', verifyTrackingEvent(TrackingEvent.THIRD_QUARTILE));
            it('should send the third quartile operative event', () => {
                sinon.assert.called(parameters.operativeEventManager.sendThirdQuartile);
            });
        });
        describe('on AdVideoComplete', () => {
            beforeEach(triggerVPAIDEvent('AdVideoComplete'));
            it('should trigger complete tracking', verifyTrackingEvent(TrackingEvent.COMPLETE));
            it('should send the view operative event', () => {
                sinon.assert.called(parameters.operativeEventManager.sendView);
            });
            it('should set the finish state to COMPLETE', () => {
                sinon.assert.calledWith(adUnit.setFinishState, FinishState.COMPLETED);
            });
        });
        describe('on AdSkipped', () => {
            beforeEach(triggerVPAIDEvent('AdSkipped'));
            it('should trigger skip tracking', verifyTrackingEvent(TrackingEvent.SKIP));
            it('should send the skip operative event', () => {
                sinon.assert.called(parameters.operativeEventManager.sendSkip);
            });
            it('should set the finish state to SKIPPED', () => {
                sinon.assert.calledWith(adUnit.setFinishState, FinishState.SKIPPED);
            });
            it('should hide the ad unit', () => {
                sinon.assert.called(adUnit.hide);
            });
        });
        describe('on AdError', () => {
            beforeEach(triggerVPAIDEvent('AdError'));
            it('should trigger error tracking', verifyTrackingEvent(TrackingEvent.ERROR));
            it('should set the finish state to ERROR', () => {
                sinon.assert.calledWith(adUnit.setFinishState, FinishState.ERROR);
            });
            it('should hide the ad unit', () => {
                sinon.assert.called(adUnit.hide);
            });
        });
        describe('on AdClickThru', () => {
            const checkClickThroughTracking = () => {
                const urls = parameters.campaign.getVideoClickTrackingURLs();
                for (const url of urls) {
                    sinon.assert.calledWith(parameters.thirdPartyEventManager.sendWithGet, 'vpaid video click', TestFixtures.getSession().getId(), url);
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
                        sinon.assert.calledWith(adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));
                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
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
                        sinon.assert.calledWith(adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));
                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZQQUlEL1ZQQUlERXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDNUYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBZ0MsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN4RyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTVELFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7SUFDakQsSUFBSSxZQUErQixDQUFDO0lBQ3BDLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksR0FBWSxDQUFDO0lBQ2pCLElBQUksTUFBbUIsQ0FBQztJQUN4QixJQUFJLFVBQXdDLENBQUM7SUFFN0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFB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