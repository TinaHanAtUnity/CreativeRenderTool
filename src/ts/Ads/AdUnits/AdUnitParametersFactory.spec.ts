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

jest.mock('Ads/Views/Privacy.ts');
jest.mock('AdMob/Views/AdMobView.ts');

describe('AdUnitParametresFactoryTest', () => {
    let campaign: AdMobCampaignMock;
    let placement: PlacementMock;
    let thirPartyEventManager: ThirdPartyEventManagerMock;
    let adUnitParametersFactory: AbstractAdUnitParametersFactory<Campaign, IAdMobAdUnitParameters>;
    let thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;
    let clientInfo: ClientInfoMock;

    beforeEach(() => {
        const core = new Core();
        const ads = new Ads();
        clientInfo = new ClientInfo();
        campaign = new AdMobCampaign();
        placement = new Placement();
        thirPartyEventManager = new ThirdPartyEventManager();
        thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
        adUnitParametersFactory = new AdMobAdUnitParametersFactory(core, ads);
        adUnitParametersFactory.create(campaign, placement, Orientation.NONE, '123', 'option');
    });

    describe('when getBaseParameters', () => {
        it('it should set third party event macros on creation', () => {
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
