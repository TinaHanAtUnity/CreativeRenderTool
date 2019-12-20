import { BannerAdUnitFactory as Base } from 'Banners/AdUnits/BannerAdUnitFactory';

export type BannerAdUnitFactoryMock = Base & {
    canCreateAdUnit: jest.Mock;
    createAdUnit: jest.Mock;
};

export const BannerAdUnitFactory = jest.fn(() => {
    return <BannerAdUnitFactoryMock>{
        canCreateAdUnit: jest.fn(),
        createAdUnit: jest.fn()
    };
});
