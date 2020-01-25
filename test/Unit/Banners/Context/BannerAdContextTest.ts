import { BannerAdContext, BannerLoadState } from 'Banners/Context/BannerAdContext';
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
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

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
            sandbox.stub(ProgrammaticTrackingService, 'reportMetricEvent').returns(Promise.resolve());
            sandbox.stub(ProgrammaticTrackingService, 'reportMetricEventWithTags').returns(Promise.resolve());
            sandbox.stub(ProgrammaticTrackingService, 'reportErrorEvent').returns(Promise.resolve());
        });

        afterEach(() => {
            sandbox.restore();
            clock.restore();
        });

        const loadBannerAdUnit = () => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            (<sinon.SinonStub>adUnit.onLoad).returns(Promise.resolve());
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
                sandbox.assert.called(asStub(adUnit.onLoad));
            });

            it('should call sendLoadEvent', () => {
                sandbox.assert.calledOnce(<sinon.SinonStub>bannerModule.Api.BannerListenerApi.sendLoadEvent);
                sandbox.assert.calledWith(<sinon.SinonStub>bannerModule.Api.BannerListenerApi.sendLoadEvent, placementId);
            });

            it('should report banner ad unit loaded', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEvent, 'banner_ad_unit_loaded');
            });

            it('should report banner load', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEventWithTags, 'banner_ad_load', ['ads_sdk2_bls:Unloaded']);
            });

            it('should report banner ad request', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEvent, 'banner_ad_request');
            });

            it('should report banner ad fill', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEvent, 'banner_ad_fill');
            });

            it('should call onLoad again when banner has aleady loaded', () => {
                return bannerAdContext.load().then(() => {
                    sandbox.assert.calledTwice(asStub(adUnit.onLoad));
                });
            });

            it('should not call onLoad again while banner state is loading', () => {
                // tslint:disable-next-line:no-string-literal
                bannerAdContext['_loadState'] = BannerLoadState.Loading;
                return bannerAdContext.load().then(() => {
                    sandbox.assert.calledOnce(asStub(adUnit.onLoad));
                });
            });
        });

        const failLoadBannerAdUnit = (error: Error) => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            sandbox.stub(bannerModule.CampaignManager, 'request').rejects(error);
            sandbox.stub(bannerModule.AdUnitParametersFactory, 'create').resolves();
            sandbox.stub(bannerModule.AdUnitFactory, 'createAdUnit').returns(adUnit);
            sandbox.stub(bannerModule.Api.BannerApi, 'load').callsFake((bannerViewType: BannerViewType, width: number, height: number, bannerAdViewId: string) => {
                return Promise.resolve().then(() => bannerModule.Api.BannerApi.onBannerLoaded.trigger(bannerAdViewId));
            });
            return bannerAdContext.load();
        };

        describe('Fail loading a Banner Ad', () => {
            beforeEach(() => {
                sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendErrorEvent');
                return failLoadBannerAdUnit(new Error('failLoadBannerAdUnit'));
            });

            it('should report banner load', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEventWithTags, 'banner_ad_load', ['ads_sdk2_bls:Unloaded']);
            });

            it('should call sendErrorEvent with web view error', () => {
                sandbox.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendErrorEvent), placementId, BannerErrorCode.WebViewError, 'Banner failed to load : failLoadBannerAdUnit');
            });

            it('should report banner ad request error', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportErrorEvent, 'banner_request_error');
            });
        });

        describe('Fail loading a Banner Ad with no fill', () => {
            beforeEach(() => {
                sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendErrorEvent');
                return failLoadBannerAdUnit(new NoFillError(`No fill for ${placementId}`));
            });

            it('should report banner load', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEventWithTags, 'banner_ad_load', ['ads_sdk2_bls:Unloaded']);
            });

            it('should call sendErrorEvent with no fill', () => {
                sandbox.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendErrorEvent), placementId, BannerErrorCode.NoFillError, `Placement ${placementId} failed to fill!`);
            });

            it('should report banner ad no fill metric', () => {
                sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportMetricEvent, 'banner_ad_no_fill');
            });
        });

        describe('No fill banner scenario', () => {
            beforeEach(() => {
                sandbox.stub(bannerModule.CampaignManager, 'request').returns(Promise.reject(new NoFillError()));
                sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendErrorEvent');
            });

            it('will fail when the banner request returns NoFillError', () => {
                return bannerAdContext.load().catch((e) => {
                    sandbox.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendErrorEvent), placementId, BannerErrorCode.NoFillError, `Placement ${placementId} failed to fill!`);
                });
            });

            it('should report banner ad request error', () => {
                return bannerAdContext.load().catch((e) => {
                    sandbox.assert.calledWith(<sinon.SinonStub>ProgrammaticTrackingService.reportErrorEvent, 'banner_request_error');
                });
            });
        });
    });
}));
