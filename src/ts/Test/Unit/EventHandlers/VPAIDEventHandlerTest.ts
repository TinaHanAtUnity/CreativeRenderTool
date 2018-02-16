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
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { IntentApi } from 'Native/Api/Intent';
import { SdkApi } from 'Native/Api/Sdk';
import { Closer } from 'Views/Closer';

describe('VPAIDEventHandlerTest', () => {
    let eventHandler: VPAIDEventHandler;
    let nativeBridge: NativeBridge;
    let adUnit: VPAIDAdUnit;
    let parameters: IVPAIDAdUnitParameters;

    beforeEach(() => {
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
            comScoreTrackingService: sinon.createStubInstance(ComScoreTrackingService),
            placement: TestFixtures.getPlacement(),
            container: sinon.createStubInstance(Activity),
            configuration: sinon.createStubInstance(Configuration),
            request: sinon.createStubInstance(Request),
            forceOrientation: ForceOrientation.NONE,
            options: {}
        };
        adUnit = sinon.createStubInstance(VPAIDAdUnit);
        (<sinon.SinonStub>parameters.campaign.getSession).returns(TestFixtures.getSession());
        (<sinon.SinonStub>parameters.campaign.getAbGroup).returns(5);
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
            it('should send the comscore end event', () => {
                sinon.assert.called(<sinon.SinonSpy>parameters.comScoreTrackingService.sendEvent);
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
                    sinon.assert.calledWith(<sinon.SinonSpy>adUnit.sendThirdPartyEvent, `vpaid video click`, url);
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
