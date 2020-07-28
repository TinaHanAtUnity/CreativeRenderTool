import { AdMobCampaign, AdMobCampaignMock } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { Ads } from 'Ads/__mocks__/Ads';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo.ts';
import { Core } from 'Core/__mocks__/Core';

import { ThirdPartyEventMacro, UnityEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { AdMobAdUnitParametersFactory } from 'AdMob/AdUnits/AdMobAdUnitParametersFactory';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';
import { VastCampaign, VastCampaignMock } from 'VAST/Models/__mocks__/VastCampaign';
import { Vast, VastMock } from 'VAST/Models/__mocks__/Vast';
import { VastAdVerification, VastAdVerificationMock } from 'VAST/Models/__mocks__/VastAdVerification';
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
    let placement: PlacementMock;
    let thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;
    let clientInfo: ClientInfoMock;

    describe('AdmobParametersFactory', () => {
        let campaign: AdMobCampaignMock;
        let adUnitParametersFactory: AbstractAdUnitParametersFactory<Campaign, IAdMobAdUnitParameters>;
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
                    [UnityEventMacro.AD_UNIT_ID_IMPRESSION]: 'test_ad_unit_1',
                    [UnityEventMacro.AD_UNIT_ID_OPERATIVE]: 'test_ad_unit_1'
                });
            });
        });
    });

    describe('VastParametersFactory', () => {
        let campaign: VastCampaignMock;
        let adUnitParametersFactory: AbstractAdUnitParametersFactory<Campaign, IVastAdUnitParameters>;
        let vast: VastMock;

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
                        let parameters: IVastAdUnitParameters;
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

                const vastAdVerificton1: VastAdVerificationMock = new VastAdVerification();
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
