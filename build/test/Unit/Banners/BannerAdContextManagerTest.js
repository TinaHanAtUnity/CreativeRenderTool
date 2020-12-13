import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';
describe('BannerAdContextManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let bannerModule;
    let adsModule;
    let coreModule;
    let bannerAdContext;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        coreModule = TestFixtures.getCoreModule(nativeBridge);
        adsModule = TestFixtures.getAdsModule(coreModule);
        bannerModule = TestFixtures.getBannerModule(adsModule, core);
    });
    describe('Banner', () => {
        let placementId;
        let bannerAdViewId;
        let sandbox;
        let sendErrorEventStub;
        let loadBannerContextStub;
        beforeEach(() => {
            placementId = 'banner';
            bannerAdViewId = 'banerAdViewId';
            sandbox = sinon.createSandbox();
            sendErrorEventStub = sandbox.stub(bannerModule.Api.BannerListenerApi, 'sendErrorEvent');
            bannerAdContext = bannerModule.BannerAdContextManager.getContext(bannerAdViewId);
            if (bannerAdContext) {
                loadBannerContextStub = sandbox.stub(bannerAdContext, 'load').resolves();
            }
        });
        it('load banner context', () => {
            bannerModule.Api.BannerApi.onBannerLoadPlacement.trigger(placementId, bannerAdViewId, 320, 50);
            assert.isNotNull(bannerAdContext);
            if (bannerAdContext) {
                sinon.assert.called(loadBannerContextStub);
                sinon.assert.notCalled(sendErrorEventStub);
            }
        });
        it('no load banner context for small size', () => {
            bannerModule.Api.BannerApi.onBannerLoadPlacement.trigger(placementId, bannerAdViewId, 300, 20);
            sinon.assert.calledWith(sendErrorEventStub, bannerAdViewId, BannerErrorCode.NoFillError);
        });
        it('no placement return error', () => {
            const getPlacementSub = sandbox.stub(bannerModule.PlacementManager, 'getPlacement').withArgs(placementId).returns(false);
            bannerModule.Api.BannerApi.onBannerLoadPlacement.trigger(placementId, bannerAdViewId, 320, 50);
            sinon.assert.calledWith(sendErrorEventStub, bannerAdViewId, BannerErrorCode.WebViewError);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRDb250ZXh0TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQmFubmVycy9CYW5uZXJBZENvbnRleHRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFakUsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtJQUN4QyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQVcsQ0FBQztJQUNoQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxTQUFlLENBQUM7SUFDcEIsSUFBSSxVQUFpQixDQUFDO0lBQ3RCLElBQUksZUFBNEMsQ0FBQztJQUVqRCxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELFNBQVMsR0FBRyxZQUFZLENB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