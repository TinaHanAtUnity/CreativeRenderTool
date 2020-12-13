import { Platform } from 'Core/Constants/Platform';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { BannerModule } from 'Banners/__mocks__/BannerModule';
import { Core } from 'Core/__mocks__/Core';
import { Ads } from 'Ads/__mocks__/Ads';
import { BannerCampaign } from 'Banners/Models/__mocks__/BannerCampaign';
import { HTMLBannerAdUnit } from 'Banners/AdUnits/__mocks__/HTMLBannerAdUnit';
[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('BannerAdContext', () => {
    let placement;
    let bannerAdContext;
    let bannerModule;
    let core;
    let ads;
    const placementId = 'testBannerViewId';
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
    describe('AdUnit onShow called once for each adUnit', () => {
        let htmlBannerAdUnit;
        let bannerAttachedObserver;
        let bannerDetachObserver;
        const loadBannerAdContext = (count) => {
            if (count > 0) {
                return bannerAdContext.load().then(() => {
                    return loadBannerAdContext(count - 1);
                });
            }
            else {
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
            let onBannerLoadedObserver;
            bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn) => {
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
        const tests = [{
                loads: 1
            }, {
                loads: 2
            }, {
                loads: 5
            }];
        tests.forEach((t) => {
            describe(`loading ${t.loads}`, () => {
                let htmlBannerAdUnits = [];
                const loadBannerAdContext = (count) => {
                    if (count > 0) {
                        return bannerAdContext.load().then(() => {
                            return loadBannerAdContext(count - 1);
                        });
                    }
                    else {
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
                    const bannerAttachedObserver = bannerModule.Api.BannerApi.onBannerAttached.subscribe.mock.calls[0][0];
                    let onBannerLoadedObserver;
                    bannerModule.Api.BannerApi.onBannerLoaded.subscribe.mockImplementation((fn) => {
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
                    htmlBannerAdUnits.forEach((bannerAdUnit) => {
                        expect(bannerAdUnit.onLoad).toBeCalledTimes(1);
                    });
                });
                it(`loading ${t.loads} should trigger onShow for each ad unit`, () => {
                    htmlBannerAdUnits.forEach((bannerAdUnit) => {
                        expect(bannerAdUnit.onShow).toBeCalledTimes(1);
                    });
                });
            });
        });
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRDb250ZXh0LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9Db250ZXh0L0Jhbm5lckFkQ29udGV4dC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbEUsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRSxPQUFPLEVBQUUsWUFBWSxFQUFvQixNQUFNLGdDQUFnQyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUczQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDeEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBd0IsTUFBTSw0Q0FBNEMsQ0FBQztBQUVwRztJQUNJLFFBQVEsQ0FBQyxHQUFHO0lBQ1osUUFBUSxDQUFDLE9BQU87Q0FDbkIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBRW5ELElBQUksU0FBd0IsQ0FBQztJQUM3QixJQUFJLGVBQWdDLENBQUM7SUFDckMsSUFBSSxZQUE4QixDQUFDO0lBQ25DLElBQUksSUFBVyxDQUFDO0lBQ2hCLElBQUksR0FBUyxDQUFDO0lBQ2QsTUFBTSxXQUFXLEdBQVcsa0JBQWtCLENBQUM7SUFFL0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFNBQVMsR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUN4QixJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDZCxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDWixZQUFZLEdBQUcs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