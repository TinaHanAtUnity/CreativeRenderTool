import * as tslib_1 from "tslib";
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AbstractAdUnit } from 'Ads/AdUnits/__mocks__/AbstractAdUnit';
import { PerPlacementLoadManagerV5NoInvalidation } from 'Ads/Managers/PerPlacementLoadManagerV5NoInvalidation';
import { AdRequestManager } from 'Ads/Managers/__mocks__/AdRequestManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { Ads } from 'Ads/__mocks__/Ads';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';
[Platform.IOS, Platform.ANDROID].forEach((platform) => {
    describe(`PerPlacementLoadManagerV5NoInvalidation(${Platform[platform]})`, () => {
        let adsApi;
        let adsConfiguration;
        let coreConfiguration;
        let adRequestManager;
        let clientInfo;
        let focusManager;
        let loadAndFillEventManager;
        let refreshManager;
        describe('invalidating campaigns', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                adsApi = Ads().Api;
                adsConfiguration = AdsConfiguration();
                coreConfiguration = CoreConfiguration();
                adRequestManager = AdRequestManager();
                clientInfo = ClientInfo();
                focusManager = FocusManager();
                loadAndFillEventManager = LoadAndFillEventManager();
                refreshManager = new PerPlacementLoadManagerV5NoInvalidation(adsApi, adsConfiguration, coreConfiguration, adRequestManager, clientInfo, focusManager, false, loadAndFillEventManager);
            }));
            [
                ProgrammaticMraidParser.ContentType,
                ProgrammaticAdMobParser.ContentType,
                ProgrammaticVastParser.ContentType,
                ProgrammaticAdMobParser.ContentType,
                ProgrammaticVPAIDParser.ContentType
            ].forEach((contentType) => {
                describe(`invalidating programmatic campaign: ${contentType}`, () => {
                    let placement;
                    describe('after setting current ad unit', () => {
                        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            placement = Placement();
                            placement.getCurrentCampaign.mockReturnValue(Campaign(contentType));
                            adsConfiguration.getPlacement.mockReturnValue(placement);
                            yield refreshManager.initialize();
                            refreshManager.setCurrentAdUnit(AbstractAdUnit(), placement);
                            adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                        }));
                        it('should reset campaign', () => {
                            expect(placement.setCurrentCampaign).toBeCalledTimes(2);
                        });
                        it('should reset campaign to undefined', () => {
                            expect(placement.setCurrentCampaign).toHaveBeenNthCalledWith(2, undefined);
                        });
                        it('should reset tracking urls', () => {
                            expect(placement.setCurrentTrackingUrls).toBeCalledTimes(1);
                        });
                        it('should reset tracking urls to undefined', () => {
                            expect(placement.setCurrentTrackingUrls).toBeCalledWith(undefined);
                        });
                    });
                });
            });
            [
                PerformanceAdUnitFactory.ContentType,
                PerformanceAdUnitFactory.ContentTypeMRAID,
                PerformanceAdUnitFactory.ContentTypeVideo
            ].forEach((contentType) => {
                describe(`invalidating comet campaign: ${contentType}`, () => {
                    let placement;
                    beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        placement = Placement();
                        placement.getCurrentCampaign.mockReturnValue(Campaign(contentType));
                        adsConfiguration.getPlacement.mockReturnValue(placement);
                        yield refreshManager.initialize();
                        refreshManager.setCurrentAdUnit(AbstractAdUnit(), placement);
                        adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                    }));
                    it('should reset campaign', () => {
                        expect(placement.setCurrentCampaign).toBeCalledTimes(1);
                    });
                    it('should reset campaign to undefined', () => {
                        expect(placement.setCurrentCampaign).toBeCalledWith(undefined);
                    });
                    it('should not reset tracking urls', () => {
                        expect(placement.setCurrentTrackingUrls).toBeCalledTimes(0);
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJWNU5vSW52YWxpZGF0aW9uLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1BlclBsYWNlbWVudExvYWRNYW5hZ2VyVjVOb0ludmFsaWRhdGlvbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFdEUsT0FBTyxFQUFFLHVDQUF1QyxFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDL0csT0FBTyxFQUFFLGdCQUFnQixFQUF3QixNQUFNLHlDQUF5QyxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBd0IsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDeEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQW9CLE1BQU0sc0NBQXNDLENBQUM7QUFDdEYsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsaUJBQWlCLEVBQXlCLE1BQU0seUNBQXlDLENBQUM7QUFDbkcsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDeEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHVCQUF1QixFQUFF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