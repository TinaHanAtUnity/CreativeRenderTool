import { HTMLBannerAdUnit as Base } from 'Banners/AdUnits/HTMLBannerAdUnit';

export type HTMLBannerAdUnitMock = Base & {
    onLoad: jest.Mock;
    onDestroy: jest.Mock;
    onShow: jest.Mock;
    onHide: jest.Mock;
};

export const HTMLBannerAdUnit = jest.fn(() => {
    return <HTMLBannerAdUnitMock>{
        onLoad: jest.fn(),
        onDestroy: jest.fn(),
        onShow: jest.fn(),
        onHide: jest.fn()
    };
});
