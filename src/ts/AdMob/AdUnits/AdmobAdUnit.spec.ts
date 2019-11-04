import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Ads } from 'Ads/__mocks__/Ads';
import { AdMobView } from 'AdMob/Views/__mocks__/AdMobView';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Store } from 'Store/__mocks__/Store';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import {
    ProgrammaticTrackingService,
    ProgrammaticTrackingServiceMock
} from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';

describe('AdmobAdUnitTest', () => {

    let admobAdUnit: AdMobAdUnit;
    let admobAdUnitParameters: IAdMobAdUnitParameters;
    let pts: ProgrammaticTrackingServiceMock;
    let placement: PlacementMock;

    beforeEach(() => {
        const ads = new Ads();
        const store = new Store();
        const core = new Core();
        placement = new Placement();

        pts = new ProgrammaticTrackingService();

        admobAdUnitParameters = {
            view: new AdMobView(),
            adMobSignalFactory: new AdMobSignalFactory(),
            forceOrientation: Orientation.NONE,
            focusManager: new FocusManager(),
            container: new AdUnitContainer(),
            deviceInfo: new DeviceInfo(),
            clientInfo: new ClientInfo(),
            thirdPartyEventManager: new ThirdPartyEventManager(),
            operativeEventManager: new OperativeEventManager(),
            placement: placement,
            campaign: new AdMobCampaign(),
            platform: Platform.TEST,
            core: core.Api,
            ads: ads.Api,
            store: store.Api,
            coreConfig: new CoreConfiguration(),
            adsConfig: new AdsConfiguration(),
            request: new RequestManager(),
            options: undefined,
            privacyManager: new UserPrivacyManager(),
            programmaticTrackingService: pts,
            privacy: new AbstractPrivacy(),
            privacySDK: new PrivacySDK()
        };
        admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);
    });

    afterEach(async () => {
        await admobAdUnit.hide();
    });

    describe('when creating AdmobAdUnit and allowSkip is false', () => {
        beforeEach(async () => {
            placement.allowSkip.mockReturnValue(false);
            admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);

            await admobAdUnit.show();
        });

        it('should have called reportMetricEvent 1 time', () => {
            expect(pts.reportMetricEvent).toHaveBeenCalledTimes(1);
        });

        it('should have called reportMetricEvent with AdmobMetric.AdmobRewardedVideoStart', () => {
            expect(pts.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobRewardedVideoStart);
        });

        describe('when sendRewardEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendRewardEvent();
            });

            it('should have called reportMetricEvent 2 times', () => {
                expect(pts.reportMetricEvent).toHaveBeenCalledTimes(2);
            });

            it('should have called reportMetricEvent with AdmobMetric.AdmobUserWasRewarded', () => {
                expect(pts.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobUserWasRewarded);
            });
        });

        describe('when sendSkipEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendSkipEvent();
            });

            it('should have called reportMetricEvent 2 times', () => {
                expect(pts.reportMetricEvent).toHaveBeenCalledTimes(2);
            });

            it('should have called reportMetricEvent with AdmobMetric.AdmobUserWasRewarded', () => {
                expect(pts.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobUserSkippedRewardedVideo);
            });
        });
    });

    describe('when creating AdmobAdUnit and allowSkip is true', () => {
        beforeEach(async () => {
            placement.allowSkip.mockReturnValue(true);
            admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);

            await admobAdUnit.show();
        });

        it('should not have called reportMetricEvent', () => {
            expect(pts.reportMetricEvent).not.toHaveBeenCalled();
        });

        describe('when sendRewardEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendRewardEvent();
            });

            it('should not have called reportMetricEvent', () => {
                expect(pts.reportMetricEvent).not.toHaveBeenCalled();
            });
        });

        describe('when sendSkipEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendSkipEvent();
            });

            it('should not have called reportMetricEvent', () => {
                expect(pts.reportMetricEvent).not.toHaveBeenCalled();
            });
        });
    });
});