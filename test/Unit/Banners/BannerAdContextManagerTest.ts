import { IAdsApi, IAds } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { BannerModule } from 'Banners/BannerModule';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';

describe('BannerAdContextManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let bannerModule: BannerModule;
    let adsModule: IAds;
    let coreModule: ICore;
    let bannerAdContext: BannerAdContext | undefined;

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
        let placementId: string;
        let bannerAdViewId: string;
        let sandbox: sinon.SinonSandbox;
        let sendErrorEventStub: sinon.SinonStub;
        let loadBannerContextStub: sinon.SinonStub;

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
