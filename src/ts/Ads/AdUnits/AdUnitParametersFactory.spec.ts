import { AdMobCampaign, AdMobCampaignMock } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { ThirdPartyEventManager, ThirdPartyEventManagerMock } from 'Ads/Managers/__mocks__/ThirdPartyEventManager.ts';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { Ads } from 'Ads/__mocks__/Ads';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo.ts';
import { Core } from 'Core/__mocks__/Core';

import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
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

jest.mock('Ads/Views/Privacy.ts');
jest.mock('AdMob/Views/AdMobView.ts');
jest.mock('Ads/Views/VastVideoOverlay');

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
        });

        describe('when getBaseParameters', () => {
            it('it should set third party event macros on creation', () => {
                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option');

                expect(thirdPartyEventManagerFactory.create).toHaveBeenCalledWith({
                    [ThirdPartyEventMacro.ZONE]: undefined,
                    [ThirdPartyEventMacro.SDK_VERSION]: '',
                    [ThirdPartyEventMacro.GAMER_SID]: '123',
                    [ThirdPartyEventMacro.OM_ENABLED]: 'false',
                    [ThirdPartyEventMacro.OM_VENDORS]: '',
                    [ThirdPartyEventMacro.OMIDPARTNER]: 'Unity3d/1.2.10',
                    [ThirdPartyEventMacro.CACHEBUSTING]: '-1'
                });
            });
        });
    });

    describe('VastParametersFactory', () => {
        let campaign: VastCampaignMock;
        let adUnitParametersFactory: AbstractAdUnitParametersFactory<Campaign, IVastAdUnitParameters>;

        beforeEach(() => {
            const core = new Core();
            const ads = new Ads();
            campaign = new VastCampaign();
            placement = new Placement();
            adUnitParametersFactory = new VastAdUnitParametersFactory(core, ads);
        });

        describe('when creating parameters', () => {
            it('it should not set om tracking if an adverification does not exist in the adVerifications array', () => {

                const vast: VastMock = new Vast();
                campaign.getVast.mockReturnValue(vast);

                vast.getAdVerifications.mockReturnValue([]);

                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option');
                expect(campaign.setOmEnabled).toHaveBeenCalledTimes(0);
                expect(campaign.setOMVendors).toHaveBeenCalledTimes(0);
            });

            it('it should set om tracking if an adverification exists in the adVerifications array', () => {

                const vast: VastMock = new Vast();
                const vastAdVerificton1: VastAdVerificationMock = new VastAdVerification();
                const verificationResource = new VastVerificationResource('https://scootmcdoot.com', 'omid');
                vastAdVerificton1.getVerficationResources.mockReturnValue([verificationResource]);

                vast.getAdVerifications.mockReturnValue([vastAdVerificton1]);
                campaign.getVast.mockReturnValue(vast);

                adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option');
                expect(campaign.setOmEnabled).toHaveBeenCalled();
                expect(campaign.setOMVendors).toHaveBeenCalled();
            });
        });
    });
});
