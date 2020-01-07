import { BannerAdContextManager as Base } from 'Banners/Managers/BannerAdContextManager';

export type BannerAdContextManagerMock = Base & {
    removeContext: jest.Mock;
    getContext: jest.Mock;
    createContext: jest.Mock;
};

export const BannerAdContextManager = jest.fn(() => {
    return <BannerAdContextManagerMock>{
        removeContext: jest.fn(),
        getContext: jest.fn(),
        createContext: jest.fn()
    };
});
