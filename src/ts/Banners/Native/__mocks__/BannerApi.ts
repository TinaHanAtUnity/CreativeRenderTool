import { BannerApi as Base } from 'Banners/Native/BannerApi';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type BannerApiMock = Base & {
    onBannerResized: ObservableMock;
    onBannerVisibilityChanged: ObservableMock;
    onBannerAttached: ObservableMock;
    onBannerDetached: ObservableMock;
    onBannerLoaded: ObservableMock;
    onBannerDestroyed: ObservableMock;
    onBannerLoadPlacement: ObservableMock;
    onBannerDestroyBanner: ObservableMock;
    setRefreshRate: jest.Mock;
    load: jest.Mock;
    handleEvent: jest.Mock;
};

export const BannerApi = jest.fn(() => {
    return <BannerApiMock>{
        onBannerResized: Observable(),
        onBannerVisibilityChanged: Observable(),
        onBannerAttached: Observable(),
        onBannerDetached: Observable(),
        onBannerLoaded: Observable(),
        onBannerDestroyed: Observable(),
        onBannerLoadPlacement: Observable(),
        onBannerDestroyBanner: Observable(),
        setRefreshRate: jest.fn(),
        load: jest.fn(),
        handleEvent: jest.fn()
    };
});
