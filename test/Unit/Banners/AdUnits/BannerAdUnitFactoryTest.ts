import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

describe('BannerAdUnitFactoryTest', () => {
    describe('when creating an ad unit for a BannerCampaign', () => {
        let campaign: BannerCampaign;
        let nativeBridge: NativeBridge;
        let parameters: IBannerAdUnitParameters;

        beforeEach(() => {
            campaign = sinon.createStubInstance(BannerCampaign);
            nativeBridge = sinon.createStubInstance(NativeBridge);
            parameters = <IBannerAdUnitParameters>{
                campaign
            };
        });

        it('should return a banner ad unit', () => {
            const factory = new BannerAdUnitFactory();
            const adUnit = factory.createAdUnit(parameters);
            assert.instanceOf(adUnit, DisplayHTMLBannerAdUnit, 'Returned ad unit is not a BannerAdUnit.');
        });
    });
});
