import { Platform } from 'Core/Constants/Platform';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { BannerModule, BannerModuleMock } from 'Banners/__mocks__/BannerModule';
import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { Ads } from 'Ads/__mocks__/Ads';
import { BannerCampaign } from 'Banners/Models/__mocks__/BannerCampaign';
import { HTMLBannerAdUnit, HTMLBannerAdUnitMock } from 'Banners/AdUnits/__mocks__/HTMLBannerAdUnit';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('BannerAdContext', () => {

    let placement: PlacementMock;
    let bannerAdContext: BannerAdContext;
    let bannerModule: BannerModuleMock;
    let core: ICore;
    let ads: IAds;
    const placementId: string = 'testBannerViewId';

    beforeEach(() => {
        placement = Placement();
        core = Core();
        ads = Ads();
        bannerModule = BannerModule();
        bannerAdContext = new BannerAdContext(placement, placementId, {
            w: 320,
            h: 50
        }, bannerModule, ads, core);
    });

    describe('AdUnit onShow called', () => {
        const tests: {
            loads: number;
        }[] = [{
            loads: 1
        }, {
            loads: 2
        }, {
            loads: 5
        }];

        tests.forEach((t) => {
            describe(`loading ${t.loads}`, () => {
                let htmlBannerAdUnit: HTMLBannerAdUnitMock;

                const loadBannerAdContext = (count: number): Promise<void> => {
                    if (count > 0) {
                        return bannerAdContext.load().then(() => {
                            return loadBannerAdContext(count - 1);
                        });
                    } else {
                        return Promise.resolve();
                    }
                };

                beforeEach(() => {
                    htmlBannerAdUnit = HTMLBannerAdUnit();
                    bannerModule.CampaignManager.request.mockReturnValue(Promise.resolve(BannerCampaign()));
                    bannerModule.AdUnitParametersFactory.create.mockReturnValue(Promise.resolve());
                    bannerModule.AdUnitFactory.createAdUnit.mockReturnValue(Promise.resolve(htmlBannerAdUnit));
                    // this mock subscribe is called when the context is constructed
                    const bannerAttachedObserver: (viewId: string) => void = bannerModule.Api.BannerApi.onBannerAttached.subscribe.mock.calls[0][0];
                    let onBannerLoadedObserver: () => void;
                    bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn: () => void) => {
                        onBannerLoadedObserver = fn;
                    });
                    bannerModule.Api.BannerApi.load.mockImplementation(() => {
                        onBannerLoadedObserver();
                    });
                    htmlBannerAdUnit.onLoad.mockReturnValue(Promise.resolve());
                    bannerModule.Api.BannerListenerApi.sendLoadEvent.mockReturnValue(Promise.resolve());
                    bannerAttachedObserver(placementId);
                    return loadBannerAdContext(t.loads);
                });

                it(`should call BannerAdUnitParametersFactory.create`, () => {
                    expect(bannerModule.AdUnitParametersFactory.create).toBeCalledTimes(t.loads);
                });

                it(`should call BannerAdUnitFactory.createAdUnit`, () => {
                    expect(bannerModule.AdUnitFactory.createAdUnit).toBeCalledTimes(t.loads);
                });

                it(`should call BannerApi.onBannerLoaded.subscribe`, () => {
                    expect(bannerModule.Api.BannerApi.onBannerLoaded.subscribe).toBeCalledTimes(t.loads);
                });

                it(`should call BannerApi.load`, () => {
                    expect(bannerModule.Api.BannerApi.load).toBeCalledTimes(t.loads);
                });

                it(`should call onLoad ${t.loads} times`, () => {
                    expect(htmlBannerAdUnit.onLoad).toBeCalledTimes(t.loads);
                });

                it(`loading ${t.loads} should trigger ${t.loads} onShow`, () => {
                    expect(htmlBannerAdUnit.onShow).toBeCalledTimes(t.loads);
                });
            });
        });
    });

}));
