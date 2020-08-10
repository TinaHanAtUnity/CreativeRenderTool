import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AbstractAdUnit } from 'Ads/AdUnits/__mocks__/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { PerPlacementLoadManagerV5NoInvalidation } from 'Ads/Managers/PerPlacementLoadManagerV5NoInvalidation';
import { AdRequestManager, AdRequestManagerMock } from 'Ads/Managers/__mocks__/AdRequestManager';
import { AdsConfiguration, AdsConfigurationMock } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { Ads } from 'Ads/__mocks__/Ads';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager, FocusManagerMock } from 'Core/Managers/__mocks__/FocusManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration, CoreConfigurationMock } from 'Core/Models/__mocks__/CoreConfiguration';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { LoadAndFillEventManagerMock, LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';

[Platform.IOS, Platform.ANDROID].forEach((platform) => {
    describe(`PerPlacementLoadManagerV5NoInvalidation(${Platform[platform]})`, () => {
        let adsApi: IAdsApi;
        let adsConfiguration: AdsConfigurationMock;
        let coreConfiguration: CoreConfigurationMock;
        let adRequestManager: AdRequestManagerMock;
        let clientInfo: ClientInfoMock;
        let focusManager: FocusManagerMock;
        let loadAndFillEventManager: LoadAndFillEventManagerMock;
        let refreshManager: PerPlacementLoadManagerV5NoInvalidation;

        describe('invalidating campaigns', () => {
            beforeEach(async () => {
                adsApi = Ads().Api;
                adsConfiguration = AdsConfiguration();
                coreConfiguration = CoreConfiguration();
                adRequestManager = AdRequestManager();
                clientInfo = ClientInfo();
                focusManager = FocusManager();
                loadAndFillEventManager = LoadAndFillEventManager();

                refreshManager = new PerPlacementLoadManagerV5NoInvalidation(adsApi, adsConfiguration, coreConfiguration, adRequestManager, clientInfo, focusManager, false, loadAndFillEventManager);
            });

            [
                ProgrammaticMraidParser.ContentType,
                ProgrammaticAdMobParser.ContentType,
                ProgrammaticVastParser.ContentType,
                ProgrammaticAdMobParser.ContentType,
                ProgrammaticVPAIDParser.ContentType
            ].forEach((contentType) => {
                describe(`invalidating programmatic campaign: ${contentType}`, () => {
                    let placement: PlacementMock;

                    describe('after setting current ad unit', () => {
                        beforeEach(async () => {
                            placement = Placement();

                            placement.getCurrentCampaign.mockReturnValue(Campaign(contentType));
                            adsConfiguration.getPlacement.mockReturnValue(placement);

                            await refreshManager.initialize();
                            refreshManager.setCurrentAdUnit(AbstractAdUnit(), placement);
                            adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                        });

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
                    let placement: PlacementMock;

                    beforeEach(async () => {
                        placement = Placement();

                        placement.getCurrentCampaign.mockReturnValue(Campaign(contentType));
                        adsConfiguration.getPlacement.mockReturnValue(placement);

                        await refreshManager.initialize();
                        refreshManager.setCurrentAdUnit(AbstractAdUnit(), placement);
                        adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                    });

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
