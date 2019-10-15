
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { IBannerModule } from 'Banners/IBannerModule';
import { IAds } from 'Ads/IAds';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

describe('BannerAdUnitParameterFactory', () => {

    let core: ICore;
    let ads: IAds;
    let bannerModule: IBannerModule;

    let factory: BannerAdUnitParametersFactory;

    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        bannerModule = TestFixtures.getBannerModule(ads, core);

        factory = new BannerAdUnitParametersFactory(bannerModule, ads, core);
    });

    it('should create thirdPartyManager with the correct template values', () => {
        const placement: Placement = sinon.createStubInstance(Placement);
        (<sinon.SinonStub>placement.getId).returns('1');
        const campaign: BannerCampaign = sinon.createStubInstance(BannerCampaign);
        const sdkVersion = core.ClientInfo.getSdkVersion().toString();
        const webPlayerContainer: WebPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        return factory.create('test', campaign, placement, webPlayerContainer).then((params) => {
            assert.deepEqual((<any>params.thirdPartyEventManager)._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': sdkVersion
            });
        });
    });
});
