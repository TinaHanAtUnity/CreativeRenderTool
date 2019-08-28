import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IBannerModule } from 'Banners/IBannerModule';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { IAds } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import 'mocha';
import * as sinon from 'sinon';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { HTMLBannerAdUnit } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { asStub } from 'TestHelpers/Functions';
import { NoFillError } from 'Banners/Managers/BannerCampaignManager';
import { BannerViewType } from 'Banners/Native/BannerApi';
import { BannerSizeStandardDimensions } from 'Banners/Utilities/BannerSizeUtil';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('BannerAdContext', () => {
    context(`${platform === Platform.ANDROID ? 'Android' : 'iOS'}`, () => {
        let backend: Backend;
        let core: ICore;
        let ads: IAds;
        let bannerModule: IBannerModule;
        let bannerAdContext: BannerAdContext;
        let campaign: BannerCampaign;
        let sandbox: sinon.SinonSandbox;
        let adUnit: IBannerAdUnit;
        const placementId = 'banner';
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            sandbox = sinon.createSandbox();
            backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreModule(nativeBridge);
            ads = TestFixtures.getAdsModule(core);
            bannerModule = TestFixtures.getBannerModule(ads, core);
            campaign = TestFixtures.getBannerCampaign();
            const placement = TestFixtures.getPlacement();
            placement.set('id', placementId);
            placement.set('adTypes', ['BANNER']);
            bannerAdContext = bannerModule.BannerAdContextManager.createContext(placement, placementId, BannerSizeStandardDimensions);
        });

        afterEach(() => {
            sandbox.restore();
            clock.restore();
        });

        const loadBannerAdUnit = () => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            sandbox.stub(bannerModule.CampaignManager, 'request').resolves(campaign);
            sandbox.stub(bannerModule.AdUnitParametersFactory, 'create').resolves();
            sandbox.stub(bannerModule.AdUnitFactory, 'createAdUnit').returns(adUnit);
            sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendLoadEvent');
            sandbox.stub(bannerModule.Api.BannerApi, 'load').callsFake((bannerViewType: BannerViewType, width: number, height: number, bannerAdViewId: string) => {
                return Promise.resolve().then(() => bannerModule.Api.BannerApi.onBannerLoaded.trigger(bannerAdViewId));
            });
            return bannerAdContext.load();
        };

        describe('Loading a Banner Ad', () => {
            beforeEach(loadBannerAdUnit);

            it('should call onLoad', () => {
                sinon.assert.called(asStub(adUnit.onLoad));
            });

            context('on first load', () => {
                it('should send the load event', () => {
                    sinon.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendLoadEvent), placementId);
                });
            });
        });

        describe('No fill banner scenario', () => {
            beforeEach(() => {
                sandbox.stub(bannerModule.CampaignManager, 'request').returns(Promise.reject(new NoFillError()));
                sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendNoFillEvent');
            });

            it('will fail when the banner request returns NoFillError', () => {
                return bannerAdContext.load().catch((e) => {
                    sinon.assert.called(asStub(bannerModule.Api.BannerListenerApi.sendNoFillEvent));
                });
            });
        });
    });
}));
