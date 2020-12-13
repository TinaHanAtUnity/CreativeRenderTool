import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { Ads } from 'Ads/__mocks__/Ads';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo.ts';
import { Core } from 'Core/__mocks__/Core';
import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { AdMobAdUnitParametersFactory } from 'AdMob/AdUnits/AdMobAdUnitParametersFactory';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { Vast } from 'VAST/Models/__mocks__/Vast';
import { VastAdVerification } from 'VAST/Models/__mocks__/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { VastHTMLEndScreen } from 'VAST/Views/VastHTMLEndScreen';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
jest.mock('VAST/Views/VastHTMLEndScreen');
jest.mock('VAST/Views/VastStaticEndScreen');
jest.mock('Ads/Views/Privacy.ts');
jest.mock('AdMob/Views/AdMobView.ts');
jest.mock('Ads/Views/VastVideoOverlay');
jest.mock('html/OMID.html', () => {
    return {
        'default': 'HTMLRenderTest'
    };
});
describe('AdUnitParametersFactoryTest', () => {
    let placement;
    let thirdPartyEventManagerFactory;
    let clientInfo;
    describe('AdmobParametersFactory', () => {
        let campaign;
        let adUnitParametersFactory;
        beforeEach(() => {
            const core = new Core();
            const ads = new Ads();
            clientInfo = new ClientInfo();
            campaign = new AdMobCampaign();
            placement = new Placement();
            thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
            adUnitParametersFactory = new AdMobAdUnitParametersFactory(core, ads);
            placement.getAdUnitId.mockReturnValue('test_ad_unit_1');
        });
        describe('when getBaseParameters', () => {
            it('it should set third party event macros on creation', () => {
                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option', false);
                expect(thirdPartyEventManagerFactory.create).toHaveBeenCalledWith({
                    [ThirdPartyEventMacro.ZONE]: 'video',
                    [ThirdPartyEventMacro.SDK_VERSION]: '3420',
                    [ThirdPartyEventMacro.GAMER_SID]: '123',
                    [ThirdPartyEventMacro.OM_ENABLED]: 'false',
                    [ThirdPartyEventMacro.OM_VENDORS]: '',
                    [ThirdPartyEventMacro.OMIDPARTNER]: 'Unity3d/1.2.10',
                    [ThirdPartyEventMacro.CACHEBUSTING]: '-1',
                    [ThirdPartyEventMacro.AD_UNIT_ID_IMPRESSION]: 'test_ad_unit_1',
                    [ThirdPartyEventMacro.AD_UNIT_ID_OPERATIVE]: 'test_ad_unit_1'
                });
            });
        });
    });
    describe('VastParametersFactory', () => {
        let campaign;
        let adUnitParametersFactory;
        let vast;
        beforeEach(() => {
            const core = new Core();
            const ads = new Ads();
            vast = new Vast();
            campaign = new VastCampaign();
            placement = new Placement();
            adUnitParametersFactory = new VastAdUnitParametersFactory(core, ads);
            campaign.getVast.mockReturnValue(vast);
        });
        describe('when creating parameters', () => {
            describe('when creating endscreen parameters', () => {
                beforeEach(() => {
                    vast.getAdVerifications.mockReturnValue([]);
                });
                [
                    { hasStaticEndscreen: true, hasHtmlEndscreen: true, expectedType: VastHTMLEndScreen, description: 'when static and html endscreen both exist', expectedResult: 'vast endscreen should be html endscreen' },
                    { hasStaticEndscreen: false, hasHtmlEndscreen: true, expectedType: VastHTMLEndScreen, description: 'when static endscreen does not exist and html endscreen exists', expectedResult: 'vast endscreen should be html endscreen' },
                    { hasStaticEndscreen: true, hasHtmlEndscreen: false, expectedType: VastStaticEndScreen, description: 'when static endscreen exists and html endscreen does not exist', expectedResult: 'vast endscreen should be static endscreen' }
                ].forEach(({ hasStaticEndscreen, hasHtmlEndscreen, expectedType, description, expectedResult }) => {
                    describe(description, () => {
                        let parameters;
                        beforeEach(() => {
                            campaign.hasStaticEndscreen.mockReturnValue(hasStaticEndscreen);
                            campaign.hasHtmlEndscreen.mockReturnValue(hasHtmlEndscreen);
                            parameters = adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option', false);
                        });
                        it(expectedResult, () => {
                            expect(parameters.endScreen).toBeInstanceOf(expectedType);
                        });
                    });
                });
            });
            it('it should not set om tracking if an adverification does not exist in the adVerifications array', () => {
                vast.getAdVerifications.mockReturnValue([]);
                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option', false);
                expect(campaign.setOmEnabled).toHaveBeenCalledTimes(0);
                expect(campaign.setOMVendors).toHaveBeenCalledTimes(0);
            });
            it('it should set om tracking if an adverification exists in the adVerifications array', () => {
                const vastAdVerificton1 = new VastAdVerification();
                vastAdVerificton1.getVerificationVendor.mockReturnValue('notIAS');
                const verificationResource = new VastVerificationResource('https://scootmcdoot.com', 'omid');
                vastAdVerificton1.getVerficationResources.mockReturnValue([verificationResource]);
                vast.getAdVerifications.mockReturnValue([vastAdVerificton1]);
                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option', false);
                expect(campaign.setOmEnabled).toHaveBeenCalled();
                expect(campaign.setOMVendors).toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0UGFyYW1ldGVyc0ZhY3Rvcnkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvQWRVbml0cy9BZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQXFCLE1BQU0sc0NBQXNDLENBQUM7QUFDeEYsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDeEMsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqRixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDM0UsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFFMUYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBS3JFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxZQUFZLEVBQW9CLE1BQU0sb0NBQW9DLENBQUM7QUFDcEYsT0FBTyxFQUFFLElBQUksRUFBWSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxrQkFBa0IsRUFBMEIsTUFBTSwwQ0FBMEMsQ0FBQztBQUN0RyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDMUMsSUFBSSxDQUFDLElBQUks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