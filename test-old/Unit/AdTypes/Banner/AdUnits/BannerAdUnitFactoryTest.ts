import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { BannerAdUnit } from 'Banners/AdUnits/BannerAdUnit';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

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
