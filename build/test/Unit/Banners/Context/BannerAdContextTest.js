import { BannerLoadState } from 'Banners/Context/BannerAdContext';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { HTMLBannerAdUnit } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { asStub } from 'TestHelpers/Functions';
import { NoFillError } from 'Banners/Managers/BannerCampaignManager';
import { BannerSizeStandardDimensions } from 'Banners/Utilities/BannerSizeUtil';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('BannerAdContext', () => {
    context(`${platform === Platform.ANDROID ? 'Android' : 'iOS'}`, () => {
        let backend;
        let core;
        let ads;
        let bannerModule;
        let bannerAdContext;
        let campaign;
        let sandbox;
        let adUnit;
        const placementId = 'banner';
        let clock;
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
            sandbox.stub(SDKMetrics, 'reportMetricEvent');
            sandbox.stub(SDKMetrics, 'reportMetricEventWithTags');
            sandbox.stub(SDKMetrics, 'sendBatchedEvents');
        });
        afterEach(() => {
            sandbox.restore();
            clock.restore();
        });
        const loadBannerAdUnit = () => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            adUnit.onLoad.returns(Promise.resolve());
            sandbox.stub(bannerModule.CampaignManager, 'request').resolves(campaign);
            sandbox.stub(bannerModule.AdUnitParametersFactory, 'create').resolves();
            sandbox.stub(bannerModule.AdUnitFactory, 'createAdUnit').returns(adUnit);
            sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendLoadEvent');
            sandbox.stub(bannerModule.Api.BannerApi, 'load').callsFake((bannerViewType, width, height, bannerAdViewId) => {
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
                sandbox.assert.calledOnce(bannerModule.Api.BannerListenerApi.sendLoadEvent);
                sandbox.assert.calledWith(bannerModule.Api.BannerListenerApi.sendLoadEvent, placementId);
            });
            it('should report banner ad unit loaded', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_ad_unit_loaded');
            });
            it('should report banner load', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEventWithTags, 'banner_ad_load', { 'bls': 'Unloaded' });
            });
            it('should report banner ad request', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_ad_request');
            });
            it('should report banner ad fill', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_ad_fill');
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
        const failLoadBannerAdUnit = (error) => {
            adUnit = sandbox.createStubInstance(HTMLBannerAdUnit);
            sandbox.stub(bannerModule.CampaignManager, 'request').rejects(error);
            sandbox.stub(bannerModule.AdUnitParametersFactory, 'create').resolves();
            sandbox.stub(bannerModule.AdUnitFactory, 'createAdUnit').returns(adUnit);
            sandbox.stub(bannerModule.Api.BannerApi, 'load').callsFake((bannerViewType, width, height, bannerAdViewId) => {
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
                sandbox.assert.calledWith(SDKMetrics.reportMetricEventWithTags, 'banner_ad_load', { 'bls': 'Unloaded' });
            });
            it('should call sendErrorEvent with web view error', () => {
                sandbox.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendErrorEvent), placementId, BannerErrorCode.WebViewError, 'Banner failed to load : failLoadBannerAdUnit');
            });
            it('should report banner ad request error', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_request_error');
            });
        });
        describe('Fail loading a Banner Ad with no fill', () => {
            beforeEach(() => {
                sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendErrorEvent');
                return failLoadBannerAdUnit(new NoFillError(`No fill for ${placementId}`));
            });
            it('should report banner load', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEventWithTags, 'banner_ad_load', { 'bls': 'Unloaded' });
            });
            it('should call sendErrorEvent with no fill', () => {
                sandbox.assert.calledWith(asStub(bannerModule.Api.BannerListenerApi.sendErrorEvent), placementId, BannerErrorCode.NoFillError, `Placement ${placementId} failed to fill!`);
            });
            it('should report banner ad no fill metric', () => {
                sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_ad_no_fill');
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
                    sandbox.assert.calledWith(SDKMetrics.reportMetricEvent, 'banner_request_error');
                });
            });
        });
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRDb250ZXh0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9CYW5uZXJzL0NvbnRleHQvQmFubmVyQWRDb250ZXh0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1CLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJbkQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNqRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdEQ7SUFDSSxRQUFRLENBQUMsR0FBRztJQUNaLFFBQVEsQ0FBQyxPQUFPO0NBQ25CLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUNuRCxPQUFPLENBQUMsR0FBRyxRQUFRLEtBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUU7UUFDakUsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksSUFBVyxDQUFDO1FBQ2hCLElBQUksR0FBUyxDQUFDO1FB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