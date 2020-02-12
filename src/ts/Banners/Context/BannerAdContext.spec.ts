import { Platform } from 'Core/Constants/Platform';
import { BannerAdContext, BannerLoadState } from 'Banners/Context/BannerAdContext';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { BannerModule, BannerModuleMock } from 'Banners/__mocks__/BannerModule';
import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { Ads } from 'Ads/__mocks__/Ads';
import { BannerCampaign } from 'Banners/Models/__mocks__/BannerCampaign';
import { HTMLBannerAdUnit, HTMLBannerAdUnitMock } from 'Banners/AdUnits/__mocks__/HTMLBannerAdUnit';
import { ProgrammaticTrackingService, BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

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

    describe('BannerAdContext load once', () => {
        let htmlBannerAdUnit: HTMLBannerAdUnitMock;
        let bannerAttachedObserver: (viewId: string) => void;
        let bannerDetachObserver: (viewId: string) => void;

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
            bannerModule.CampaignManager.request.mockImplementation(() => {
                return Promise.resolve(BannerCampaign());
            });
            bannerModule.AdUnitParametersFactory.create.mockReturnValue(Promise.resolve());
            bannerModule.AdUnitFactory.createAdUnit.mockImplementation(() => {
                const adUnit = HTMLBannerAdUnit();
                adUnit.onLoad.mockReturnValue(Promise.resolve());
                htmlBannerAdUnit = adUnit;
                return Promise.resolve(adUnit);
            });
            // this mock subscribe is called when the context is constructed
            bannerAttachedObserver = bannerModule.Api.BannerApi.onBannerAttached.subscribe.mock.calls[0][0];
            bannerDetachObserver = bannerModule.Api.BannerApi.onBannerDetached.subscribe.mock.calls[0][0];

            let onBannerLoadedObserver: () => void;
            bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn: () => void) => {
                onBannerLoadedObserver = fn;
            });
            bannerModule.Api.BannerApi.load.mockImplementation(() => {
                onBannerLoadedObserver();
            });
            bannerModule.Api.BannerListenerApi.sendLoadEvent.mockReturnValue(Promise.resolve());
            return loadBannerAdContext(1);
        });

        it(`after loading a banner pts batch called`, () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenCalledWith(BannerMetric.BannerAdLoad, [
                ProgrammaticTrackingService.createAdsSdkTag('bls', BannerLoadState[BannerLoadState.Unloaded]) // banner load state
            ]);
            expect(ProgrammaticTrackingService.reportMetricEvent).toHaveBeenCalledWith(BannerMetric.BannerAdRequest);
            expect(ProgrammaticTrackingService.reportMetricEvent).toHaveBeenCalledWith(BannerMetric.BannerAdFill);
            expect(ProgrammaticTrackingService.reportMetricEvent).toHaveBeenCalledWith(BannerMetric.BannerAdUnitLoaded);
            expect(ProgrammaticTrackingService.sendBatchedEvents).toBeCalledTimes(1);
        });
    });

    describe('AdUnit onShow called once for each adUnit', () => {
        let htmlBannerAdUnit: HTMLBannerAdUnitMock;
        let bannerAttachedObserver: (viewId: string) => void;
        let bannerDetachObserver: (viewId: string) => void;

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
            bannerModule.CampaignManager.request.mockImplementation(() => {
                return Promise.resolve(BannerCampaign());
            });
            bannerModule.AdUnitParametersFactory.create.mockReturnValue(Promise.resolve());
            bannerModule.AdUnitFactory.createAdUnit.mockImplementation(() => {
                const adUnit = HTMLBannerAdUnit();
                adUnit.onLoad.mockReturnValue(Promise.resolve());
                htmlBannerAdUnit = adUnit;
                return Promise.resolve(adUnit);
            });
            // this mock subscribe is called when the context is constructed
            bannerAttachedObserver = bannerModule.Api.BannerApi.onBannerAttached.subscribe.mock.calls[0][0];
            bannerDetachObserver = bannerModule.Api.BannerApi.onBannerDetached.subscribe.mock.calls[0][0];

            let onBannerLoadedObserver: () => void;
            bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn: () => void) => {
                onBannerLoadedObserver = fn;
            });
            bannerModule.Api.BannerApi.load.mockImplementation(() => {
                onBannerLoadedObserver();
            });
            bannerModule.Api.BannerListenerApi.sendLoadEvent.mockReturnValue(Promise.resolve());
            return loadBannerAdContext(1);
        });

        it(`after loading a banner triggering attach twice`, () => {
            bannerAttachedObserver(placementId);
            bannerDetachObserver(placementId);
            bannerAttachedObserver(placementId);
            expect(htmlBannerAdUnit.onShow).toBeCalledTimes(1);
        });
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
                let htmlBannerAdUnits: HTMLBannerAdUnitMock[] = [];

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
                    htmlBannerAdUnits = [];
                    bannerModule.CampaignManager.request.mockImplementation(() => {
                        return Promise.resolve(BannerCampaign());
                    });
                    bannerModule.AdUnitParametersFactory.create.mockReturnValue(Promise.resolve());
                    bannerModule.AdUnitFactory.createAdUnit.mockImplementation(() => {
                        const adUnit = HTMLBannerAdUnit();
                        adUnit.onLoad.mockReturnValue(Promise.resolve());
                        htmlBannerAdUnits.push(adUnit);
                        return Promise.resolve(adUnit);
                    });
                    // this mock subscribe is called when the context is constructed
                    const bannerAttachedObserver: (viewId: string) => void = bannerModule.Api.BannerApi.onBannerAttached.subscribe.mock.calls[0][0];
                    let onBannerLoadedObserver: () => void;
                    bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn: () => void) => {
                        onBannerLoadedObserver = fn;
                    });
                    bannerModule.Api.BannerApi.load.mockImplementation(() => {
                        onBannerLoadedObserver();
                    });
                    bannerModule.Api.BannerListenerApi.sendLoadEvent.mockReturnValue(Promise.resolve());
                    bannerAttachedObserver(placementId);
                    return loadBannerAdContext(t.loads);
                });

                it('should call BannerApi.onBannerAttached.subscribe once', () => {
                    expect(bannerModule.Api.BannerApi.onBannerAttached.subscribe).toBeCalledTimes(1);
                });

                it('should call BannerApi.onBannerDetached.subscribe once', () => {
                    expect(bannerModule.Api.BannerApi.onBannerDetached.subscribe).toBeCalledTimes(1);
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

                it(`should call onLoad for each ad unit`, () => {
                    htmlBannerAdUnits.forEach((bannerAdUnit: HTMLBannerAdUnitMock) => {
                        expect(bannerAdUnit.onLoad).toBeCalledTimes(1);
                    });
                });

                it(`loading ${t.loads} should trigger onShow for each ad unit`, () => {
                    htmlBannerAdUnits.forEach((bannerAdUnit: HTMLBannerAdUnitMock) => {
                        expect(bannerAdUnit.onShow).toBeCalledTimes(1);
                    });
                });
            });
        });
    });

}));
