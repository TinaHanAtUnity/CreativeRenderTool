import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Closer } from 'Ads/Views/Closer';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IntentApi } from 'Core/Native/Android/Intent';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { SdkApi } from 'Core/Native/Sdk';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { DefaultPrivacy } from 'Ads/Views/DefaultPrivacy';

describe('VPAIDEventHandlerTest', () => {
    let eventHandler: VPAIDEventHandler;
    let nativeBridge: NativeBridge;
    let adUnit: VPAIDAdUnit;
    let parameters: IVPAIDAdUnitParameters;

    beforeEach(() => {
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        parameters = {
            campaign: sinon.createStubInstance(VPAIDCampaign),
            closer: sinon.createStubInstance(Closer),
            vpaid: sinon.createStubInstance(VPAID),
            endScreen: sinon.createStubInstance(VPAIDEndScreen),
            focusManager: sinon.createStubInstance(FocusManager),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: TestFixtures.getPlacement(),
            container: sinon.createStubInstance(Activity),
            coreConfig: sinon.createStubInstance(CoreConfiguration),
            adsConfig: sinon.createStubInstance(AdsConfiguration),
            request: sinon.createStubInstance(Request),
            privacy: sinon.createStubInstance(DefaultPrivacy),
            forceOrientation: Orientation.NONE,
            options: {},
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: programmaticTrackingService
        };
        adUnit = sinon.createStubInstance(VPAIDAdUnit);
        (<sinon.SinonStub>parameters.campaign.getSession).returns(TestFixtures.getSession());
        (<sinon.SinonStub>parameters.campaign.getVideoClickTrackingURLs).returns(['https://tracking.unityads.unity3d.com']);
        (<sinon.SinonStub>parameters.campaign.getVideoClickThroughURL).returns('https://unityads.unity3d.com');

        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge).UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        (<any>nativeBridge).Intent = sinon.createStubInstance(IntentApi);
        (<any>nativeBridge).Sdk = sinon.createStubInstance(SdkApi);

        eventHandler = new VPAIDEventHandler(nativeBridge, adUnit, parameters);
    });

    describe('VPAID events', () => {
        const triggerVPAIDEvent = (eventType: string, ...args: any[]) => {
            return () => {
                eventHandler.onVPAIDEvent(eventType, args);
            };
        };

        const verifyTrackingEvent = (eventType: string) => {
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
            it('should trigger firstQuartile tracking', verifyTrackingEvent('firstQuartile'));
            it('should send the first quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendFirstQuartile);
            });
        });

        describe('on AdVideoMidpoint', () => {
            beforeEach(triggerVPAIDEvent('AdVideoMidpoint'));
            it('should trigger midpoint tracking', verifyTrackingEvent('midpoint'));
            it('should send the midpoint operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendMidpoint);
            });
        });

        describe('on AdVideoThirdQuartile', () => {
            beforeEach(triggerVPAIDEvent('AdVideoThirdQuartile'));
            it('should trigger thirdQuartile tracking', verifyTrackingEvent('thirdQuartile'));
            it('should send the third quartile operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendThirdQuartile);
            });
        });

        describe('on AdVideoComplete', () => {
            beforeEach(triggerVPAIDEvent('AdVideoComplete'));
            it('should trigger complete tracking', verifyTrackingEvent('complete'));
            it('should send the view operative event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.operativeEventManager.sendView);
            });
            it('should set the finish state to COMPLETE', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.COMPLETED);
            });
        });

        describe('on AdSkipped', () => {
            beforeEach(triggerVPAIDEvent('AdSkipped'));

            it('should trigger skip tracking', verifyTrackingEvent('skip'));
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

            it('should trigger error tracking', verifyTrackingEvent('error'));
            it('should set the finish state to ERROR', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.ERROR);
            });

            it('should hide the ad unit', () => {
                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });

        describe('on AdClickThru', () => {
            const checkClickThroughTracking = () => {
                const urls = parameters.campaign.getVideoClickTrackingURLs();
                for (const url of urls) {
                    sinon.assert.calledWith(<sinon.SinonSpy>parameters.thirdPartyEventManager.sendEvent, 'vpaid video click', TestFixtures.getSession().getId(), url);
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
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
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
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, aURL);
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });

                describe('when url is not passed', () => {
                    beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));

                    it('should open the url from the VAST definition', () => {
                        sinon.assert.calledWith(<sinon.SinonSpy>adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
                    });
                    it('should send click tracking events', checkClickThroughTracking);
                });
            });
        });
    });
});
