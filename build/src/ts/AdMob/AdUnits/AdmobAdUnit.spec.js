import * as tslib_1 from "tslib";
import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AdMobView } from 'AdMob/Views/__mocks__/AdMobView';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Placement } from 'Ads/Models/__mocks__/Placement';
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
import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
describe('AdmobAdUnitTest', () => {
    let admobAdUnit;
    let admobAdUnitParameters;
    let placement;
    let thirdPartyEventManager;
    beforeEach(() => {
        const ads = new Ads();
        const store = new Store();
        const core = new Core();
        placement = new Placement();
        thirdPartyEventManager = new ThirdPartyEventManager();
        admobAdUnitParameters = {
            view: new AdMobView(),
            adMobSignalFactory: new AdMobSignalFactory(),
            forceOrientation: Orientation.NONE,
            focusManager: new FocusManager(),
            container: new AdUnitContainer(),
            deviceInfo: new DeviceInfo(),
            clientInfo: new ClientInfo(),
            thirdPartyEventManager: thirdPartyEventManager,
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
    afterEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield admobAdUnit.hide();
    }));
    describe('when creating AdmobAdUnit and allowSkip is false', () => {
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement.allowSkip.mockReturnValue(false);
            admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);
            yield admobAdUnit.show();
        }));
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
            it('should call the complete event', () => {
                expect(thirdPartyEventManager.sendTrackingEvents).toHaveBeenCalledWith(admobAdUnitParameters.campaign, TrackingEvent.COMPLETE, 'admob', undefined, undefined);
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
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement.allowSkip.mockReturnValue(true);
            admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);
            yield admobAdUnit.show();
        }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JBZFVuaXQuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZE1vYi9BZFVuaXRzL0FkbW9iQWRVbml0LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNsRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDNUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNyRixPQUFPLEVBQUUsc0JBQXNCLEVBQThCLE1BQU0sK0NBQStDLENBQUM7QUFDbkgsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1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