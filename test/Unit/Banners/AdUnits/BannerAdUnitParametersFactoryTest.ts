
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { IBanners } from 'Banners/IBanners';
import { IAds } from 'Ads/IAds';

describe('BannerAdUnitParameterFactory', () => {

    let core: ICore;
    let ads: IAds;
    let banner: IBanners;

    let factory: BannerAdUnitParametersFactory;

    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        banner = TestFixtures.getBannerModule(ads, core);

        factory = new BannerAdUnitParametersFactory(banner, ads, core);
    });

    it('should create thirdPartyManager with the correct template values', () => {
        const placement: Placement = sinon.createStubInstance(Placement);
        (<sinon.SinonStub>placement.getId).returns('1');
        const campaign: BannerCampaign = sinon.createStubInstance(BannerCampaign);
        const sdkVersion = core.ClientInfo.getSdkVersion().toString();
        return factory.create(campaign, placement).then((params) => {
            assert.deepEqual((<any>params.thirdPartyEventManager)._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': sdkVersion
            });
        });
    });
});
