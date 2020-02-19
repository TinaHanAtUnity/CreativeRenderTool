import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AdMobView } from 'AdMob/Views/__mocks__/AdMobView';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { Ads } from 'Ads/__mocks__/Ads';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Store } from 'Store/__mocks__/Store';

import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';

describe('AdmobAdUnitTest', () => {

    let admobAdUnit: AdMobAdUnit;
    let admobAdUnitParameters: IAdMobAdUnitParameters;
    let placement: PlacementMock;

    beforeEach(() => {
        const ads = new Ads();
        const store = new Store();
        const core = new Core();
        placement = new Placement();

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
            expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledTimes(1);
        });

        it('should have called reportMetricEvent with AdmobMetric.AdmobRewardedVideoStart', () => {
            expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobRewardedVideoStart);
        });

        describe('when sendRewardEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendRewardEvent();
            });

            it('should have called reportMetricEvent 2 times', () => {
                expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledTimes(2);
            });

            it('should have called reportMetricEvent with AdmobMetric.AdmobUserWasRewarded', () => {
                expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobUserWasRewarded);
            });
        });

        describe('when sendSkipEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendSkipEvent();
            });

            it('should have called reportMetricEvent 2 times', () => {
                expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledTimes(2);
            });

            it('should have called reportMetricEvent with AdmobMetric.AdmobUserWasRewarded', () => {
                expect(SDKMetrics.reportMetricEvent).toHaveBeenCalledWith(AdmobMetric.AdmobUserSkippedRewardedVideo);
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
            expect(SDKMetrics.reportMetricEvent).not.toHaveBeenCalled();
        });

        describe('when sendRewardEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendRewardEvent();
            });

            it('should not have called reportMetricEvent', () => {
                expect(SDKMetrics.reportMetricEvent).not.toHaveBeenCalled();
            });
        });

        describe('when sendSkipEvent is called', () => {
            beforeEach(() => {
                admobAdUnit.sendSkipEvent();
            });

            it('should not have called reportMetricEvent', () => {
                expect(SDKMetrics.reportMetricEvent).not.toHaveBeenCalled();
            });
        });
    });
});
