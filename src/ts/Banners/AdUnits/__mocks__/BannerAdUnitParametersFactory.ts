import { BannerAdUnitParametersFactory as Base } from 'Banners/AdUnits/BannerAdUnitParametersFactory';

export type BannerAdUnitParametersFactoryMock = Base & {
    create: jest.Mock;
};

export const BannerAdUnitParametersFactory = jest.fn(() => {
    return <BannerAdUnitParametersFactoryMock>{
        create: jest.fn()
    };
});
