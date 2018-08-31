import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { BannerCampaign } from 'Banners/Models/Campaigns/BannerCampaign';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { BannerAdUnit } from 'Banners/AdUnits/BannerAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';

describe('BannerAdUnitFactoryTest', () => {
    describe('when creating an ad unit for a BannerCampaign', () => {
        let campaign: BannerCampaign;
        let nativeBridge: NativeBridge;
        let parameters: IAdUnitParameters<BannerCampaign>;

        beforeEach(() => {
            campaign = sinon.createStubInstance(BannerCampaign);
            nativeBridge = sinon.createStubInstance(NativeBridge);
            parameters = <IAdUnitParameters<BannerCampaign>>{
                campaign
            };
        });

        it('should return a banner ad unit', () => {
            const adUnit = BannerAdUnitFactory.createAdUnit(nativeBridge, parameters);
            assert.instanceOf(adUnit, BannerAdUnit, 'Returned ad unit is not a BannerAdUnit.');
        });
    });
});
