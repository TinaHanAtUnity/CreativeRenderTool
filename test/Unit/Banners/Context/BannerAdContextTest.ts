import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IBanners } from 'Banners/IBanners';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { IAds } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { HTMLBannerAdUnit } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { asStub } from 'TestHelpers/Functions';
import { BannerCampaignManager, NoFillError } from 'Banners/Managers/BannerCampaignManager';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('BannerAdContext', () => {
    context(`${platform === Platform.ANDROID ? 'Android' : 'iOS'}`, () => {
        let backend: Backend;
        let core: ICore;
        let ads: IAds;
        let banners: IBanners;
        let bannerAdContext: BannerAdContext;
        let campaign: BannerCampaign;
        let sandbox: sinon.SinonSandbox;
        let adUnit: IBannerAdUnit;
        const placementId = 'banner';

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreModule(nativeBridge);
            ads = TestFixtures.getAdsModule(core);
            banners = TestFixtures.getBannerModule(ads, core);
            campaign = TestFixtures.getBannerCampaign();
            bannerAdContext = banners.AdContext;
        });

        afterEach(() => sandbox.restore());

        const loadBannerAdUnit = () => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            sandbox.stub(banners.CampaignManager, 'request').resolves(campaign);
            sandbox.stub(banners.AdUnitParametersFactory, 'create').resolves();
            sandbox.stub(banners.AdUnitFactory, 'createAdUnit').returns(adUnit);
            sandbox.stub(banners.Api.Listener, 'sendLoadEvent');
            sandbox.stub(banners.Api.Banner, 'load').callsFake(() => {
                return Promise.resolve().then(() => banners.Api.Banner.onBannerLoaded.trigger());
            });
            return bannerAdContext.load(placementId);
        };

        describe('Loading a Banner Ad', () => {
            beforeEach(loadBannerAdUnit);

            it('should call onLoad', () => {
                sinon.assert.called(asStub(adUnit.onLoad));
            });

            context('on first load', () => {
                it('should send the load event', () => {
                    sinon.assert.calledWith(asStub(banners.Api.Listener.sendLoadEvent), placementId);
                });
            });
        });

        describe('Refreshing a banner ad unit', () => {
            let clock: sinon.SinonFakeTimers;
            beforeEach(() => {
                clock = sinon.useFakeTimers();
                return loadBannerAdUnit();
            });
            afterEach(() => {
                clock.restore();
            });
            context('if not shown yet', () => {
                it('should not refresh after 30 seconds', () => {
                    clock.tick(31 * 1000);
                    return Promise.resolve().then(() => {
                        sinon.assert.calledOnce(asStub(banners.CampaignManager.request));
                    });
                });
            });
            context('after being shown', () => {
                beforeEach(() => {
                    banners.Api.Banner.onBannerOpened.trigger();
                });

                it('should refresh after 30 seconds', () => {
                    clock.tick(31 * 1000);
                    return Promise.resolve().then(() => {
                        sinon.assert.calledTwice(asStub(banners.CampaignManager.request));
                    });
                });
            });
        });

        xdescribe('No fill banner scenario', () => {
            beforeEach(() => {
                adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
                sandbox.stub(banners.CampaignManager, 'request').returns(Promise.reject(new NoFillError()));
                sandbox.stub(banners.Api.Listener, 'sendErrorEvent');
                sandbox.stub(banners.Api.Banner, 'load');
            });

            it('will fail when the request returns the error thing', () => {
                return bannerAdContext.load(placementId).catch((e) => {
                    sinon.assert.called(asStub(banners.Api.Listener.sendErrorEvent));
                });
            });
        });
    });
}));
